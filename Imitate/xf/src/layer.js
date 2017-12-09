/**
const pathToRegExp = require('path-to-regexp');
const re = pathToRegExp(path, keys, {
	sensitive:, // true表示路由大小写敏感，默认false
	strict:, // false表示后面的斜杠是可选的，默认false
	end:, // false表示路径将在开始时匹配，默认true
	delimiter:, // 分隔符，默认/
	endsWith:, // 结束字符
	delimiters: // 在解析时考虑分隔符的字符列表，默认./
})
返回值为regexp

static:
pathToRegExp.parse()
pathToRegExp.compile()
pathToRegexp.tokensToRegExp(tokens, options)
pathToRegexp.tokensToFunction(tokens)
 */
const pathToRegExp = require('path-to-regexp');

class Layer {
	constructor(path, methods = [], middleware, options = { name: null }) {
		this.path = path;
		this.methods = methods;
		this.options = options;
		this.name = options.name;
		this.paramNames = [];
		this.stack = Array.isArray(middleware) ? middleware : [middleware];
		methods.forEach(function (method) {
			let len = this.methods.push(method.toUpperCase());
			if (this.methods[len - 1] === 'GET') this.methods.unshift('HEAD');
		}, this);
		this.regexp = pathToRegExp(path, this.paramNames, this.options);
	}
	// 获取 path 匹配的 route
	match(path) {
		return this.regexp.test(path);
	}
	params(path, captures, params = {}) {
		captures.forEach(function (c, index) {
			let pn = this.paramNames[index];
			if (pn) {
				params[pn.name] = c ? safeDecodeURIComponent(c) : c;
			}
		}, this);
		return params;
	}
	captures(path) {
		if (this.options.ignoreCaptures) return [];
		return path.match(this.regexp).slice(1);
	}
	url(params, options) {

	}
	param(param, fn) {
		return this;
	}
	setPrefix(prefix) {
		if (this.path) {
			this.path = prefix + this.path;
			this.paramNames = [];
			this.regexp = pathToRegExp(this.path, this.paramNames, this.options);
		}
		return this;
	}
};

function safeDecodeURIComponent(text) {
	try {
		return decodeURIComponent(text);
	} catch (error) {
		console.error(err);
		return text;
	}
};

module.exports = Layer;