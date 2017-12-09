'use strict';
const METHODS = require('http').METHODS;
const compose = require('./compose');
const Layer = require('./layer');

class Router {
	constructor(options = {}) {
		this.options = options;
		this.methods = options.methods || [
			'HEAD',
			'OPTIONS',
			'GET',
			'PUT',
			'PATCH',
			'POST',
			'DELETE'
		];
		this.params = {};
		this.stack = [];
	}
	static url(path, params) {
		return Layer.prototype.url.call({
			path
		}, params);
	}
	// 注册全局路由
	use(...arg) {
		let path = '(.*)';
		// 第一个参数是数组，并且是 path 数组
		if (Array.isArray(arg[0] && 'string' === arg[0][0])) {
			arg[0].forEach(function (p) {
				this.use(p, ...arg.slice(1));
			}, this);
			return this;
		}
		// 如果有 path
		const hasPath = 'string' === typeof arg[0];
		if (hasPath) path = arg.shift();

		arg.forEach(function (m) {
			const router = m.router;
			if (router) {
				router.stack.forEach(function (nestedLayer) {
					if (path) nestedLayer.setPrefix(path);
					if (this.options.prefix) nestedLayer.setPrefix(this.options.prefix);
					this.stack.push(nestedLayer);
				}, this);
			} else {
				this.register(path, [], m, {
					end: false,
					ignoreCaptures: !hasPath
				});
			}
		}, this);
		return this;
	}
	// 设置路径前缀
	prefix(prefix) {
		prefix = prefix.replace(/\/$/, '');
		this.options.prefix = prefix;
		this.stack.forEach(function (route) {
			route.setPrefix(prefix);
		});
		return this;
	}
	// 入口函数，分发路由
	routes() {
		const that = this;
		// xf 中间件
		function dispatch(ctx, next) {
			let path = that.options.routerPath || ctx.routerPath || ctx.path;
			let matched = that.match(path, ctx.method);
			let layerChain, layer, i;
			if (ctx.matched) ctx.matched.push(matched.path);
			else ctx.matched = matched.path;
			ctx.router = that;
			// 没有对应的路由，则直接进入下一个中间件
			if (!matched.route) return next();
			// 找到正确的路由的 path
			let matchedLayers = matched.pathAndMathod;
			let mostSpecificLayer = matchedLayer[matchedLayers.length - 1];
			ctx._matchedRoute = mostSpecificLayer.path;
			if (mostSpecificLayer.name) ctx._matchedRouteName = mostSpecificLayer.name;
			// 使用 reduce 方法将路由的所有中间件形成一条链
			layerChain = matchedLayers.reduce(function (memo, layer) {
				// 在每个路由的中间件执行之前，根据参数不同，设置 ctx.captures 和 ctx.params
				memo.push(function (ctx, next) {
					// 返回路由的参数key
					ctx.captures = layer.captures(path, ctx.captures);
					// 返回参数的key和对应的value组成的对象
					ctx.params = layer.params(path, ctx.captures, ctx.params);
					// 执行下一个中间件
					return next();
				});
				return memo.concat(layer.stack);
			}, []);
			// 顺序执行所有中间件的执行函数，并立即执行
			return compose(layerChain)(ctx, next);
		}
		dispatch.router = this;
		return dispatch;
	}
	// 处理请求出错和options请求
	allowedMethods(options = {}) {
		let implemented = this.methods;
		function allowedMethods(ctx, next) {
			// 当所有中间件函数执行完了，并且请求出错了进行相应的处理
			return next().then(function(){
				let allowed = {};
				// 如果请求的方法koa-router不支持并且没有设置throw选项，则返回 501(未实现)
				// 如果是options请求，则返回 204(无内容)
				// 如果请求的方法支持但没有设置throw选项，则返回 405(不允许此方法 )
				if (!ctx.status || ctx.status === 400) {
					var allowedArr = Object.keys(allowed);
					if (!~implemented.indexOf(ctx.method)) {
						if (options.throw) {

						} else {
							ctx.status = 501;
							ctx.setHeader('Allow', allowedArr);
						}
					}
				} else if (allowedArr.length) {
					if (ctx.method === 'OPTIONS') {
						ctx.status = 204;
						ctx.setHeader('Allow', allowedArr);
					} else if (!allowed[ctx.method]) {
						if (options.throw) {

						} else {
							ctx.status = 405;
							ctx.setHeader('Allow', allowedArr);
						}
					}
				}
			});
		};
		return allowedMethods;
	}
	// 为url的每个方法注册路由
	all({ name, path, fn }) {
		this.register(path, method, fn, { name });
		return this;
	}
	// 重定向
	redirect(source, destination, code) {
		if (source[0] !== '/') source = this.url(source);
		if (destination[0] !== '/') destination = this.url(destination);
		return this.all({
			path: source,
			fn: function (ctx) {
				ctx.redirect(destination);
				ctx.status = code || 301;
			}
		});
	}
	// 注册路由
	register(path, method, fn, options = {}) {
		const route = new Layer(path, method, fn, {});
		// 设置路径前缀
		this.options.prefix && route.setPrefix(this.options.prefix);
		// 将全局的路由参数添加到每个路由中
		Object.keys(this.params).forEach(function (param) {
			route.param(param, this.params[param]);
		}, this);
		// 添加新路由到stack
		this.stack.push(route);
		return route;
	}
	// 获取某个路由信息
	route(name) {
		let route = this.stack.find(function (route) {
			return route.name === name;
		});
		return route;
	}
	// 获取某个路由具体url
	url(name, params) {
		const route = this.route(name);
		if (route) return route.url(Array.from(arguments));
		return new Error(`No route found for name: ${name}`);
	}
	// 获取匹配的路由
	match(path, method) {
		const matched = {
			path: [],
			pathAndMathod: [],
			route: false
		};
		this.stack.forEach((layer, index) => {
			if (layer.match(path)) {
				matched.path.push(layer);
				if (layer.methods.length ===0 || ~layer.methods.indexOf(method)) {
					matched.pathAndMathod.push(layer);
					if (layer.methods.length) matched.route = true;
				}
			}
		});
		return matched;
	}
	// 全局路由参数设置
	param(param, fn) {
		this.params[param] = fn;
		this.stack.forEach(function (route) {
			route.param(param, fn);
		});
		return this;
	}
}
// 添加verb方法
METHODS.forEach(method => {
	method = method.toLowerCase();
	Reflect.defineProperty(Router.prototype, method, {
		value(...arg) {
			const {name, path, cb} = normalizeParam(arg);
			if (path === null) throw new Error('verb params is not stable');
			else this.register(path, [method], cb, { name });
			return this;
		}
	})
});
// 对路径参数进行统一处理，从而支持多种参数传递
function normalizeParam(arg) {
	const l = arg.length;
	const pathConfig = {
		name: null,
		path: null,
		cb: null,
	};
	switch (l) {
		case 1:
			if (arg[0] instanceof Object) {
				if (arg[0].name) arg[0].name = null;
				pathConfig = arg[0];
			}
			else throw new Error('if arguments length is one, it must be a Object, like this {name:,path:,cb:,}');
			break;
		case 2:
			if (('string' === typeof arg[0] || arg[0] instanceof Array) && (arg[1] instanceof Function || arg[1] instanceof Array)) {
				pathConfig = {
					name: null,
					path: arg[0],
					cb: arg[1]
				};
			}
			else throw new Error('param type is wrone');
			break;
		case 3:
			if ('string' === typeof arg[0] && ('string' === typeof arg[1] || arg[1] instanceof Array) && (arg[2] instanceof Function || arg[2] instanceof Array)) {
				pathConfig = {
					name: arg[0],
					path: arg[1],
					cb: arg[2]
				};
			}
			else throw new Error('param type is wrone');
			break;
	}
	return pathConfig;
}

module.exports = Router;
