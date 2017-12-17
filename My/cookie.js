// 只要执行 document.cookie = 'name=wll; expires=xxx';就可以为当前域名新增 cookie
const Cookie = {
	setCookie(key, value, iDay){
		let oDate = new Date();
		oDate.setDate(oDate.getDate() + iDay);
		document.cookie = key + '=' + value + '; expires=' + oDate;
	},
	getCookie(key){
		let arr = document.cookie.split('; ');
		for (let i = 0, l = arr.length; i < l; i++) {
			let aTmp = arr[i].split('=');
			if (aTmp[0] === key) return aTmp[1];
		}
		return '';
	},
	removeCookie(key) {
		this.setCookie(key, '', -1);
	}
};
