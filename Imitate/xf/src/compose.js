'use strict';

/**
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
	/**
	 * @param {Object} context
	 * @return {Promise}
	 * @api public
	 */

	return function (context) {
		let index = -1;
		return dispatch(0);
		// 中间件调度器
		function dispatch(i) {
			if (i <= index) return Promise.reject(new Error('next() called multiple times'));
			if (i === middleware.length) return Promise.resolve();
			index = i;
			let fn = middleware[i];
			try {
				return Promise.resolve(fn(context, () => {
					return dispatch(i + 1);
				}));
			} catch (err) {
				return Promise.reject(err);
			}
		}
	};
}

module.exports = compose;