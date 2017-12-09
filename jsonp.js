function jsonp(param = {}) {
	if (!param.url) return;
	let oS = document.createElement('script'),
		oHead = document.querySelector('head'),
		cbKey = param.cbKey || 'cb',
		cbName = 'jsonp' + (new Date()).getTime(),
		mount = param.mount || window,
		data = param.data || {};

	data[cbKey] = cbName;
	mount[cbName] = function (data) {
		param.success && param.success(data);
		oHead.removeChild(oS);
	};

	oS.src = param.url + '?' + data2url(data);
	oHead.appendChild(oS);
}
