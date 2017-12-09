//判断是否支持某个css样式
//cssStr必须是标准css样式属性
function cssSupport(cssStr) {
	let styles = document.body.style || document.documentElement.style;
	let cssStr2 = cssStr.charAt(0).toUpperCase() + cssStr.substring(1);
	if ((cssStr in styles) || ('webkit' + cssStr2 in styles) || ('ms' + cssStr2 in styles) || ('moz' + cssStr2 in styles) || ('o' + cssStr2 in styles)) {
		return true;
	};
};