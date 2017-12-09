/**
 * 代理某个属性的属性
 */

class Delegator {
	constructor(proto, target) {
		this.proto = proto;
		this.target = target;
	}
	method(names) {
		let proto = this.proto;
		let target = this.target;
		names.forEach(function (name, index, self) {
			proto[name] = function () {
				return Reflect.apply(this[target][name], this[target], arguments)
				// return this[target][name].apply(this[target], arguments);
			}
		}, this);
		return this;
	}
	getter(names) {
		let proto = this.proto;
		let target = this.target;
		names.forEach(function (name, index, self) {
			Reflect.defineProperty(proto, name, {
				enumerable: true,
				get() {
					return this[target][name];
				}
			});
		}, this);
		return this;
	}
	setter(names) {
		let proto = this.proto;
		let target = this.target;
		names.forEach(function (name, index, self) {
			Reflect.defineProperty(proto, name, {
				enumerable: true,
				set(val) {
					this[target][name] = val;
				}
			});
		}, this);
		return this;
	}
	access(names) {
		let proto = this.proto;
		let target = this.target;
		names.forEach(function (name, index, self) {
			Reflect.defineProperty(proto, name, {
				enumerable: true,
				get() {
					return this[target][name];
				},
				set(val) {
					this[target][name] = val;
				}
			});
		}, this);
		return this;
	}
	fluent(names) {
		let proto = this.proto;
		let target = this.target;
		names.forEach(function (name, index, self) {
			// 以函数的方式
			proto[name] = function (val) {
				// 传值为设置target
				if ('undefined' !== typeof val) {
					this[target][name] = val;
					return this;
				} else {
					// 不传值为获取target
					return this[target][name];
				}
			};
		}, this);
		return this;
	}
};

module.exports = Delegator;
