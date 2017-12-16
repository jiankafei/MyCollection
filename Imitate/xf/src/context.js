'use strict';

const statuses = require('./statuses');
const Delegator = require('./delegator');

const context = module.exports = {
	// 会在 application 里调用
	// 会在 response 里调用
	// 该error函数是Koa2源码的，仿写并没有把重点放在错误处理上
	onerror(err) {
		if (null === err) return;
		if (!(err instanceof Error)) err = new Error(`now-error thrown: ${err}`);
		let headersSent = false;
		if (this.headersSent || !this.writable) {
			headersSent = err.headersSent = true;
		}

		// delegate
		this.app.emit('error', err, this);

		if (headersSent) return;

		const { res } = this;

		// first unset all headers
		res.getHeaderNames().forEach(name => res.removeHeader(name));

		// then set those specified
		this.setHeader(err.headers);

		// force text/plain
		this.type = 'text';

		// ENOENT support
		if ('ENOENT' === err.code) err.status = 404;

		const statusMsg = statuses.getMsg(err.status);
		// default to 500
		if ('number' !== typeof err.status || !statusMsg) err.status = 500;

		// respond
		const msg = err.expose ? err.message : statusMsg;
		this.status = err.status;
		this.length = Buffer.byteLength(msg);
		this.res.end(msg);
	}
};

const deReq = new Delegator(context, 'request');
deReq.method(['acceptsLanguages', 'acceptsEncodings', 'acceptsCharsets', 'accepts', 'getHeader', 'is']);
deReq.access(['socket', 'query', 'idempotent', 'method', 'pathname', 'url']);
deReq.getter(['origin', 'href', 'subdomains', 'protocol', 'host', 'hostname', 'headers', 'secure', 'stale', 'fresh', 'ips', 'ip']);

const deRes = new Delegator(context, 'response');
deRes.method(['attachment', 'redirect', 'removeHeader', 'vary', 'setHeader', 'appendHeader', 'flushHeaders']);
deRes.access(['status', 'message', 'body', 'length', 'type', 'lastModified', 'etag']);
deRes.getter(['headersSent', 'writable']);
