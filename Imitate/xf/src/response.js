'use strict';

const extname = require('path').extname;
const statuses = require('./statuses');
const {
	isJSON
} = require('./util');

const getType = require('mime-types').contentType;
const escape = require('escape-html');
const typeis = require('type-is').is;
const contentDisposition = require('content-disposition');

/**
 * response prototype
 */

const response = module.exports = {
	// socket
	get socket() {
		return this.res.socket;
	},
	// headers
	get headers() {
		return this.res.getHeaders() || {};
	},
	// status
	get status() {
		return this.res.statusCode;
	},
	set status(code) {
		this._explicitStatus = true; // 设置为true
		this.res.statusCode = code;
		if (this.req.httpVersionMajor < 2) this.res.statusMessage = statuses.getMsg(code);
		if (this.body && statuses.empty[code]) this.body = null;
	},
	// message
	get message() {
		return this.res.statusMessage || statuses.getMsg(this.status);
	},
	set message(msg) {
		this.res.statusMessage = msg;
	},
	// body
	get body() {
		return this._body; // 获取当前 body
	},
	set body(val) {
		const original = this._body; // 缓存当前 body
		this._body = val; // 设置新的 body

		if (this.res.headersSent) return;

		// no content
		if (!!null === !!val) {
			if (!statuses.empty[this.status]) this.status = 204;
			this.removeHeader('Content-Type');
			this.removeHeader('Content-Length');
			this.removeHeader('Transfer-Encoding');
			return;
		}

		// set the status
		if (!this._explicitStatus) this.status = 200;

		// set the content-type only if not yet set
		const hasType = !!this.headers['content-type'];

		// string
		if ('string' === typeof val) {
			if (!hasType) this.type = /^\s*</.test(val) ? 'html' : 'text';
			this.length = Buffer.byteLength(val);
			return;
		}

		// buffer
		if (Buffer.isBuffer(val)) {
			if (!hasType) this.type = 'bin';
			this.length = val.length;
			return;
		}

		// stream
		if ('function' === typeof val.pipe) {
			// overwriting
			if (null !== original && original !== val) this.removeHeader('Content-Length');

			if (!hasType) this.type = 'bin';
			return;
		}

		// json
		this.removeHeader('Content-Length');
		this.type = 'json';
	},
	// length
	get length() {
		const len = this.headers['content-length'];
		const body = this.body;

		if (!!null === !!len) {
			if (!body) return;
			if ('string' === typeof body) return Buffer.byteLength(body);
			if (Buffer.isBuffer(body)) return body.length;
			if (isJSON(body)) return Buffer.byteLength(JSON.stringify(body));
			return;
		}

		return ~~len;
	},
	set length(n) {
		this.setHeader('Content-Length', n);
	},
	// lastModified
	get lastModified() {
		const date = this.getHeader('last-modified');
		if (date) return new Date(date);
	},
	set lastModified(val) {
		if ('string' === typeof val) val = new Date(val);
		this.setHeader('Last-Modified', val.toUTCString());
	},
	// etag
	get etag() {
		return this.getHeader('ETag');
	},
	set etag(val) {
		if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
		this.setHeader('ETag', val);
	},
	// headersSent
	get headersSent() {
		return this.res.headersSent;
	},
	// writable
	get writable() {
		if (this.res.finished) return false;
		const socket = this.socket;
		if (!socket) return true;
		return socket.writable;
	},
	// type
	get type() {
		const type = this.getHeader('Content-Type');
		if (!type) return '';
		return type.split(';')[0];
	},
	set type(type) {
		type = getType(type);
		if (type) {
			this.setHeader('Content-Type', type);
		} else {
			this.removeHeader('Content-Type');
		}
	},
	vary(field) {
		vary(this.res, field);
	},
	is(types) {
		const type = this.type;
		if (!types) return type || false;
		if (!Array.isArray(types)) types = Array.from(arguments);
		return typeis(type, types);
	},
	redirect(url, alt) {
		// location
		if ('back' === url) url = this.ctx.getHeader('Referrer') || alt || '/';
		this.setHeader('Location', url);

		// status
		if (!statuses.redirect[this.status]) this.status = 302;

		// html
		if (this.ctx.accepts('html')) {
			url = escape(url);
			this.type = 'text/html; charset=utf-8';
			this.body = `Redirecting to <a href="${url}">${url}</a>.`;
			return;
		}

		// text
		this.type = 'text/plain; charset=utf-8';
		this.body = `Redirecting to ${url}.`;
	},
	attachment(filename) {
		if (filename) this.type = extname(filename);
		this.setHeader('Content-Disposition', contentDisposition(filename));
	},
	getHeader(field) {
		return this.headers[field.toLowerCase()] || '';
	},
	setHeader(field, val) {
		if (field instanceof Object) {
			for (const key in field) {
				field.hasOwnProperty(key) && this.setHeader(key, field[key]);
			}
		} else {
			if (Array.isArray(val)) val = val.map(String);
			else val = val.toString();
			this.res.setHeader(field, val);
		}
		this.res.setHeader(field, val);
	},
	appendHeader(field, val) {
		const prev = this.getHeader(field);
		if (prev) val = Array.isArray(prev) ? prev.concat(val) : [prev].concat(val);
		this.setHeader(field, val);
	},
	removeHeader(field) {
		this.res.removeHeader(field);
	}
};