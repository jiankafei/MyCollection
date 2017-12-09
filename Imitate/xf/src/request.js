'use strict';

const {
	URL,
	URLSearchParams,
	format: stringify
} = require('url');
const net = require('net');
const typeis = require('type-is');
const contentType = require('content-type');

/**
 * request prototype
 */

const request = module.exports = {
	// socket
	get socket() {
		return this.req.socket;
	},
	// method
	get method() {
		return this.req.method;
	},
	set method(val) {
		this.req.method = val;
	},
	// headers
	get headers() {
		return this.req.headers;
	},
	set headers(val) {
		this.req.headers = val;
	},
	// url
	get url() {
		return this.req.url;
	},
	set url(val) {
		if (this.req.url === val) return;
		this.req.url = val;
	},
	// href
	get href() {
		return `${this.protocol}://${this.host}${this.url}`;
	},
	// protocol
	get protocol() {
		if (this.socket.encrypted) return 'https';
		if (!this.app.proxy) return 'http';
		const proto = this.getHeader('X-Forwarded-Proto') || 'http';
		return proto.split(/\s*,\s*/)[0];
	},
	// host
	get host() {
		let host = this.app.proxy && this.getHeader('X-Forwarded-Host') || this.getHeader('Host');
		if (!host) return '';
		return host.split(/\s*,\s*/)[0];
	},
	// hostname
	get hostname() {
		const host = this.host;
		if (!host) return '';
		if ('[' === host[0]) return this.href.hostname || ''; // IPv6
		return host.split(':')[0];
	},
	// port
	get port() {
		const host = this.host;
		if (!host) return '';
		if ('[' === host[0]) return this.href.port || ''; // IPv6
		return host.split(':')[1];
	},
	// origin
	get origin() {
		return `${this.protocol}://${this.host}`;
	},
	// pathname
	get pathname() {
		return new URL(this.url).pathname;
	},
	set pathname(val) {
		const urlObj = new URL(this.url);
		if (urlObj.pathname === val) return;
		urlObj.pathname = val;
		this.url = stringify(urlObj, {
			unicode: true
		});
	},
	// query
	get query() {
		if (!this.req) return '';
		return new URL(this.url).searchParams.toString();
	},
	set query(val) {
		const urlObj = new URL(this.url);
		if (this.query === val) return false;
		urlObj.search = `?${val}`;
		this.url = stringify(urlObj, {
			unicode: true
		});
	},
	// length
	get length() {
		const len = this.getHeader('Content-Length');
		if (len === '') return false;
		return ~~len;
	},
	// secure
	get secure() {
		return 'https' === this.protocol;
	},
	// type
	get type() {
		const type = this.getHeader('Content-Type') || '';
		return type.split(';')[0];
	},
	accepts(...args) {
		return this.accept.types(...args);
	},
	acceptsEncodings(...args) {
		return this.accept.encodings(...args);
	},
	acceptsCharsets(...args) {
		return this.accept.charsets(...args);
	},
	acceptsLanguages(...args) {
		return this.accept.languages(...args);
	},
	getHeader(field) {
		const headers = this.req.headers;
		field = field.toLowerCase();
		switch (field) {
			case 'referer':
			case 'referrer':
				return headers.referrer || headers.referer || '';
			default:
				return headers[field] || '';
		}
	},
	is(types) {
		if (!types) return typeis(this.req);
		if (!Array.isArray(types)) types = [].slice.call(arguments);
		return typeis(this.req, types);
	}
};