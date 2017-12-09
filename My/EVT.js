// 浏览器端的自定义事件
class EVT {
	constructor(el){
		this.el = (el && el.nodeType === 1) ? el : document;
		this.eventMap = Object.create(null);
	}
	on(type, cb){
		if (!this.eventMap[type]) {
			if (typeof Event === 'function') {
				this.eventMap[type] = new Event(type);
			} else {
				const eventObj = document.createEvent('Event');
				eventObj.initEvent(type, true, true);
				this.eventMap[type] = eventObj;
			}
		}
		this.el.addEventListener(type, cb);
		return this;
	}
	once(type, cb){
		const newCb = () => {
			this.off(type, newCb);
			cb.apply(this.el);
		};
		this.el.addEventListener(type, newCb);
		return this;
	}
	off(type, cb){
		this.el.removeListener(type, cb);
		return this;
	}
	offAll(type){
		this.el.removeListener(type);
		return this;
	}
	emit(type){
		this.el.dispatchEvent(this.eventMap[type]);
		return this;
	}
}