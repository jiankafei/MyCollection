function resolve(arg) {
	if (this.status !== 'pending') return;
	let fn = null;
	const queue = this.resolves;
	
	setTimeout(() => {
		if (this.status === 'rejected') return;
		while (fn = queue.shift()) {
			arg = fn.call(this, arg) || arg;
		}
		this.arg = arg;
		this.status = 'resolved';
	}, 0);
}
function reject(arg) {
	if (this.status !== 'pending') return;
	let fn = null;
	const queue = this.rejects;
	
	setTimeout(() => {
		if (this.status === 'resolved') return;
		while (fn = queue.shift()) {
			arg = fn.call(this, arg) || arg;
		}
		this.arg = arg;
		this.status = 'rejected';
	}, 0);
}

class PromiseA {
	constructor(fn) {
		const that = this;
		this.status = 'pending'; // 状态
		this.arg = null; // 状态凝固后的参数
		this.resolves = [];
		this.rejects = [];
		fn(resolve.bind(this), reject.bind(this));
	}
	then(done, fail) {
		const that = this;
		return new PromiseA(function(resolve, reject) {
			// 成功回掉
			function doneBack(arg) {
				let ret = typeof done === 'function' && done(arg) || arg;
				if (ret && typeof ret['then'] === 'function') {
					ret.then(function (arg) {
						resolve(arg);
					}, function (err) {
						reject(err);
					});
				} else {
					resolve(ret);
				}
			};
			// 失败回掉
			function failBack(err) {
				err = typeof fail === 'function' && fail(err) || err;
				reject(err);
			};

			switch (that.status) {
				case 'pending':
					that.resolves.push(doneBack);
					that.rejects.push(failBack);
					break;
				case 'resolved':
					doneBack(that.arg);
					break;
				case 'rejected':
					failBack(that.arg);
					break;
			}
		});
	}
	catch (fail) {
		return this.then(undefined, fail);
	}
	static resolve(arg) {
		new PromiseA(function(resolve) {
			resolve(arg);
		});
	}
	static reject(arg) {
		new PromiseA(function(resolve, reject) {
			reject(arg);
		});
	}
}

// 示例
let ts = new PromiseA(function(resolve, reject) {
	resolve('成功');
	reject('失败');
});

ts.then(arg => {
	console.log(arg);
}).catch(err => {
	console.log(err);
});
