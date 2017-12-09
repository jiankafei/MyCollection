'use strick';

const http = require('http');
const EventEmitter = require('events');
const Cookies = require('cookies');
const accepts = require('accepts');

// 推荐使用 url模块 的 Class: URL, URLSearchParams, Method: format 对url进行处理

// koa 使用了 koa-compose 模块，用于进行中间件的开发
// koa-compose 模块实现洋葱模型的原理就是利用 async await 以及 递归实现，该包大量使用了闭包特性
// await 会等待其后的异步操作完成在执行下面的代码，如果在异步操作里再次执行异步操作，并且也是用 await 等待另一个异步操作的完成，那么这样的一个代码执行过程就形成了洋葱模型的执行过程
const compose = require('./compose');
const context = require('./context');
const request = require('./request');
const response = require('./response');
const {
	isJSON
} = require('./util');
const statuses = require('./statuses');

// Symbol key
const createContext = Symbol('createContext');
const onerror = Symbol('onerror');

// Application 主程序
class Application extends EventEmitter {
	constructor() {
		super();
		this.proxy = false; // 是否为代理
		this.subdomainOffset = 2; // ???
		this.middleware = [];
		this.env = process.env.NODE_ENV || 'development';
		// ctx req res 在 koa 里是通过 Object.create(Obj) 来创建的，这样做的原因是因为避免开发者自己修改原有的对象的属性，从而导致框架内部出错
		// 在以后的使用中，凡是向开发者暴露的都是通过这种方式间接暴露，除非有二逼青年使用 __proto__ 专门修改，这样做我不反对，没准骚年喜欢自讨bug吃
		// koa 在 context 里 使用 delegates 做了属性的授权管理
		this.context = Object.create(context);
		this.request = Object.create(request);
		this.response = Object.create(response);
	}
	use(fn) {
		if ('function' !== typeof fn) throw new TypeError('middleware must be a function!');
		this.middleware.push(fn);
		return this;
	}
	listen(...args) {
		const server = http.createServer(this.callback());
		return server.listen(...args);
	}
	callback() {
		const trigger = compose(this.middleware);
		this.on('error', this[onerror]);

		function handleFunc(ctx, trigger) {
			const res = ctx.res;
			res.statusCode = 404;
			return trigger(ctx)
				.then(() => {
					respond(ctx)
				})
				.catch(err => ctx.onerror(err));
		};

		return (req, res) => {
			const ctx = this[createContext](req, res);
			return handleFunc(ctx, trigger);
		};
	}
	[createContext](req, res) {
		const context = Object.create(this.context);
		const request = Object.create(this.request);
		const response = Object.create(this.response);

		request.ctx = response.ctx = context;
		context.app = request.app = response.app = this;
		context.req = request.req = response.req = req;
		context.res = request.res = response.res = res;
		context.response = request.response = response;
		context.request = response.request = request;
		context.originalUrl = request.originalUrl = req.url; // 保存原始url
		context.cookies = new Cookies(req, res, {
			key: this.keys,
			secure: request.secure
		});
		// request.ip = request.ips[0] || req.socket.remoteAddress || '';
		context.accept = request.accept = accepts(req);
		context.state = {};
		return context;
	}
	// 在 callback 里调用
	[onerror](err) {
		if (404 === ~~err.status || err.expose || this.silent) return;
		const msg = err.stack || err.toString();
		console.error(msg.replace(/^/gm, '  '));
	}
}

// 响应
function respond(ctx) {
	if (false === ctx.respond) return;

	const res = ctx.res;
	if (!ctx.writable) return;

	let body = ctx.body;
	const status = ctx.status;

	if (statuses.empty[status]) {
		ctx.body = null;
		return res.end();
	}
	if ('HEAD' === ctx.method) {
		if (!res.headersSent && isJSON(body)) {
			ctx.length = Buffer.byteLength(JSON.stringify(body));
		}
		return res.end();
	}
	if (null === body) {
		body = ctx.message || String(status);
		if (!res.headersSent) {
			ctx.type = 'text';
			ctx.length = Buffer.byteLength(body);
		}
		return res.end(body);
	}
	if (Buffer.isBuffer(body)) return res.end(body);
	if ('string' === typeof body) return res.end(body);
	if ('function' === typeof body.pipe) return body.pipe(res);

	body = JSON.stringify(body);
	if (!res.headersSent) {
		ctx.length = Buffer.byteLength(body);
	}
	res.end(body);
}

// 导出
module.exports = Application;