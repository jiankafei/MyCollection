const Cookie = {
	getItem(key){
		// 没有key则返回null
		if (!key) return null;
		// encodeURIComponent(key).replace(regexp, '\\$&') 是为了给有-.+*符号的字符加上转义符\
		// document.cookie.replace(regexp, $1) 把整个cookie字符串替换为捕获组匹配的值$1，而捕获组正是要查询的key的value
		// 如果没有匹配到，则返回null
		return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
	},
	setItem(key, value, end, path, domain, secure){
		// 没有key，或者key里有关键词，则返回false
		if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) return false;
		let overtime;
		if (end) {
			if (typeof end === 'number') overtime = end === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + end;
			else if(typeof end === 'string') overtime = '; expires=' + end;
			else if (end instanceof Date) overtime = '; expires=' + end.toUTCString();
		}
		document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + overtime + (domain ? '; domain=' + domain : '') + (path ? '; path=' + path : '') + (secure ? '; secure' : '');
		return true;
	},
	removeItem(key, path, domain){
		if (!this.hasItem(key)) return false;
		document.cookie = encodeURIComponent(key) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (domain ? '; domain=' + domain : '') + (path ? '; path=' + path : '');
		return true;
	},
	hasItem(key){
		if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) return false;
		return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
	}
};