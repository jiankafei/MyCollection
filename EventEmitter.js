class EventEmitter {
	constructor(){
		this.collection = Object.create(null);
	}
	on(event, handler){
		let listeners = this.listeners(event);
		if (listeners === undefined) {
			listeners = this.collection[event] = [];
		}
		listeners.push(handler);
		return this;
	}
	off(event, handler){
		const listeners = this.listeners(event);
		if (listeners !== undefined) {
			listeners.forEach((fn, index, self) => {
				if (fn === handler) {
					listeners.splice(index, 1);
					return;
				}
			});
			if (listeners.length === 0) delete this.collection[event];
		}
		return this;
	}
	offAll(event){
		if (event) delete this.collection[event];
		else this.collection = {};
		return this;
	}
	once(event, handler){
		const newFn = () => {
			this.off(event, newFn);
			handler.apply(this);
		};
		this.on(event, newFn);
		return this;
	}
	emit(event, ...args){
		const listeners = this.listeners(event);
		if (listeners !== undefined) {
			listeners.slice().forEach(handler => {
				handler.apply(this, args);
			});
		}
		return this;
	}
	listeners(event){
		return this.collection[event];
	}
}

const a = new EventEmitter();
a.on('tt', () => {
	console.log('tt');
});
a.emit('tt');
