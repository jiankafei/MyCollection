const init = Symbol('init');
const download = Symbol('download');
const upload = Symbol('upload');
const dealData = Symbol('dealData');
const dealResponse = Symbol('dealResponse');
const createConnection = Symbol('createConnection');
class Ajax {
	constructor({
		url = null,
		method = 'get',
		data = null,
		responseType = '',
		mimeType = 'application/x-www-form-urlencoded',
		username = null,
		password = null,
		timeout = 10000,
		monitor = 'download',
		crossOrigin = false,
		cache = true,
		async = true,
		form = null,
	}){
		if (!url) return new Error('No url');
		this.url = url;
		this.method = method.toUpperCase();
		this.data = data; // 要发送的数据
		this.response = null; // 返回的数据
		// 响应类型 arraybuffer/blob/document/json/text/''(default)
		this.responseType = responseType;
		this.mimeType = mimeType; // 媒体类型编码类型enctype
		this.username = username;
		this.password = password;
		this.timeout = timeout;
		// 监听行为 download uplaod both
		this.monitor = monitor;
		this.crossOrigin = crossOrigin; // 是否跨域
		this.cache = cache; // 是否启用缓存
		this.async = async; // 是否同步
		this.timer = null;
		this.fd = new FormData(form);
		this.xhr = new XMLHttpRequest();
		this.upload = this.xhr.upload;
		this[init]();
	}
	[init](){
		if (this.xhr.timeout) this.xhr.timeout = this.timeout;
		if (this.crossOrigin) this.xhr.withCredentials = this.crossOrigin;
		switch (this.monitor) {
			case 'download':
				this[download]();
				break;
			case 'upload':
				this[upload]();
				break;
			default:
				this[download]();
				this[upload]();
		}
		this[createConnection]();
		if (!this.xhr.timeout) {
			this.timer = setTimeout(() => {
				this.abort();
				this._timeout && this._timeout();
			}, this.timeout);
		}
	}
	[download](){
		const xhr = this.xhr;
		const that = this;
		xhr.onloadstart = function(){
			that._start && that._start();
		};
		xhr.onload = function(){
			let response = that.dealResponse(this.response);
			that._done && that._done(response);
		}
		xhr.onloadend = function(){
			clearTimeout(this.timer);
			that._end && that._end();
		};
		xhr.ontimeout = function(){
			that._timeout && that._timeout();
		};
		xhr.onabort = function(){
			that._abort && that._abort();
		};
		xhr.onerror = function(){
			that._fail && that._fail(that.status);
		}
		xhr.onprocess = function(ev){
			if (ev.lengthComputable) {
				let percent = ev.loaded / ev.total;
				that._process && that._process(percent);
			} else {
				console.warn('No Process');
			}
		};
	}
	[upload](){
		const upload = this.upload;
		const that = this;
		upload.onloadstart = function(){
			that._uploadStart && that._uploadStart();
		};
		upload.onload = function(){
			that._uploadDone && that._uploadDone();
		}
		upload.onloadend = function(){
			that._uploadEnd && that._uploadEnd();
		};
		upload.ontimeout = function(){
			that._uploadTimeout && that._uploadTimeout();
		};
		upload.onabort = function(){
			that._uploadAbort && that._uploadAbort();
		};
		upload.onerror = function(){
			that._uploadFail && that._uploadFail();
		}
		upload.onprocess = function(ev){
			if (ev.lengthComputable) {
				let percent = ev.loaded / ev.total;
				that._uploadProcess && that._uploadProcess(percent);
			} else {
				console.warn('No Process');
			}
		};
	}
	[createConnection](){
		const method = this.method;
		const data = this.dealData();
		switch (method) {
			case 'GET':
				xhr.open(method, `${this.url}?${data}`, this.async, this.username, this.password);
				xhr.send(null);
				break;
			case 'POST':
				xhr.open(method, this.url, this.async, this.username, this.password);
				xhr.setRequestHeader('Content-Type', this.mimeType);
				xhr.send(data);
				break;
		}
	}
	// 处理要发送的数据
	[dealData](){
		// 非常重要
		const method = this.method;
		const data = this.data;
		const fd = this.fd;
		Object.keys(data).forEach((key, index) => {
			fd.append(key, data[key]);
		});
		if (this.method === 'GET' || this.enctype === 'application/x-www-form-urlencoded') {
			return fd;
		} else {
			switch (this.enctype) {
				case 'multipart/form-data':
					// return ...
					break;
				case 'text/plain':
					// return ...
					break;
			}
		}
	}
	// 处理返回的数据
	[dealResponse](){
		// 这里是难点
		const xhr = this.xhr;
		const res = xhr.response;
		let dealRes = res;
		switch (this.responseType) {
			case 'arraybuffer':
				if (res) dealRes = new Uint8Array(res);
				break;
			case 'blob':
				break;
			case 'document':
				dealRes = xhr.responseXML;
				break;
			case 'json':
			case 'text':
			default:
				break;
		}
	}
	// 方法
	setHeader(name, value){
		this.xhr.setRequestHeader(name, value);
	}
	getHeader(name){
		return this.xhr.getResponseHeader(name);
	}
	abort(){
		this.xhr.abort();
	}
	// 下面增删改操作不完善
	// 目前只对 get | x-www-form-urlencoded 起作用
	// 对 multipart/form-data | text/plain 没有做处理
	addData(key, val){
		this.fd.append(key, val);
	}
	setData(key, val){
		this.fd.set(key, val);
	}
	delData(key){
		this.fd.delete(key);
	}
}
// doneload
['start', 'done', 'fail', 'end', 'timeout', 'abort', 'process'].forEach((name, index) => {
	Reflect.defineProperty(Ajax.prototype, name, {
		enumerable: true,
		value(cb){
			this[`_${name}`] = cb;
			return this;
		}
	});
});
//upload
['uploadStart', 'uploadDone', 'uploadFail', 'uploadEnd', 'uploadTimeout', 'uploadAbort', 'uploadProcess'].forEach((name, index) => {
	Reflect.defineProperty(Ajax.prototype, name, {
		enumerable: true,
		value(cb){
			this[`_${name}`] = cb;
			return this;
		}
	});
});
