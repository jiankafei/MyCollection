function final(status, arg){
	const that = this;
	let fn = null;
	if (this.status !== 'pending') return;
	setTimeout(function(){
		that.status = status;
		const queue = that[status === 'resolved' ? 'resolves' : 'rejects'];
		while (fn = queue.shift()) {
			arg = fn.call(that, arg) || arg;
		}
		that.arg = arg;
	}, 0);
}
function resolve(arg) {
	final.bind(this, 'resolved', arg)();
}
function reject(arg) {
	final.bind(this, 'rejected', arg)();
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
		return new PromiseA((resolve, reject) => {
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
		new PromiseA(resolve => {
			resolve(arg);
		});
	}
	static reject(arg) {
		new PromiseA((resolve, reject) => {
			reject(arg);
		});
	}
}

// 示例
let ts = new PromiseA((resolve, reject) => {
	resolve('成功');
	reject('失败');
});

ts.then(arg => {
	console.log(arg);
}).catch(err => {
	console.log(err);
});

// 这个Promise有问题
