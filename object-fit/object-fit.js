/**
 * Image ratio
 * Author Wangle
 * @param {String} sel 选择器
 * @param {String} type [none, fill, contain, cover, position-top, position-right, position-bottom, position-left]
 * @param {String} callback 回掉
 */
function objectFit(sel, type, callback){
	let obj = $(sel);
	if (obj instanceof Array) {
		obj.forEach(function(el, index, self) {
			calcFit(el);
		});
	} else {
		calcFit(obj);
	}
	callback();
	// Add Class
	function calcFit(ele){
		let pEle = ele.parentNode,
			w = ele.naturalWidth || ele.clientWidth,
			h = ele.naturalHeight || ele.clientHeight,
			pW = pEle.clientWidth,
			pH = pEle.clientHeight;
		let ratioType = w / h > pW / pH ? 'wider' : 'taller';

		pEle.classList.add('x-object-fit');
		pEle.classList.add('x-object-fit-' + type);
		ele.classList.add('x-object-fit-' + ratioType);
	}
};
