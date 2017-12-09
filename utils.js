/**
 * author: WangLe
 */

/**
 * Data serialization
 * @param {Object} json {key: value}
 */
function json2url(json) {
	var arr = [];
	for (var name in json) {
		arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(json[name]));
	};
	return arr.join('&');
};

/**
 * Form serialization
 * @param {Object} form form元素
 */
function serialize(form) {
	var parts = [];
	field = null, i, len, j, optlen, option, optValue;
	for (var i = 0, len = form.elements.length; i < len; i++) {
		field = form.elements[i];
		switch (field.type) {
			case 'select-one':
			case 'select-multiple':
				if (field.name.length) {
					for (var j = 0, optlen = field.options.length; j < optlen; j++) {
						option = field.options[j];
						if (option.selected) {
							optValue = '';
							if (option.hasAttribute) {
								optValue = (option.hasAttribute('value') ? option.value : option.text);
							} else { //IE
								optValue = (option.attributes['value'].specified ? option.value : option.text);
							};
							parts.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(optValue));
						};
					};
				};
				break;
			case undefined:
			case 'file':
			case 'submit':
			case 'reset':
			case 'button':
				break;
			case 'radio':
			case 'checkbox':
				if (!field.checked) {
					break;
				};
			default:
				if (field.name.length) {
					parts.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
				};
		};
	};
	return parts.join('&');
};

/**
 * Add CSS Rule
 * @param {String} css css字符串
 */
function addStylesheetRules(css) {
	var head = document.documentElement.firstElementChild,
		style = document.createElement('style');
	style.type = 'text/css';
	style.styleSheet && style.styleSheet.cssText ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
	head.appendChild(style);
	return style;
};

/**
 * String to DOM
 * @param {String} str DOM字符串
 */
function strToDom(str) {
	var frag = document.createDocumentFragment(),
		oDiv = document.createElement('div'),
		nodes;
	oDiv.innerHTML = str;
	nodes = oDiv.childNodes;
	for (var i = 0, l = nodes.length; i < l; i++) {
		!!nodes[i] && frag.appendChild(nodes[i]);
	}
	oDiv = null;
	return frag;
};

/**
 * Selector
 * @param {String} sel 选择器
 */
function $(sel) {
	var el = null;
	if (sel.indexOf('#') !== -1) {
		return document.getElementById(sel.substr(1));
	} else {
		el = document.querySelectorAll(sel);
		if (typeof Array.from === 'function') return Array.from(el);
		else return [].slice.call(el);
	}
};

/**
el.oninput = function() {
	// 中文输入过程中不截断
	if($(this).prop('comStart')) return;
	var value = $(this).val();
	if(Str.byteLen(value, 3)>24){
		$(this).val(Str.getMaxlen(value, 24));
	}
}
el.oncompositionstart = function(){
	$(this).prop('comStart', true);
	console.log('中文输入：开始');
}
el.oncompositionend = function(){
	$(this).prop('comStart', false);
	console.log('中文输入：结束');
}
 */

// 字符串长度计算
const Str = {
	// 正则取到中文的个数，计算总的字节数，len是汉字的单字节长度，UTF-8是3，GB-2312是2
	byteLen: function (str, len) {
		var tmp = str.match(/[\u4e00-\u9fa5]/g) || [];
		return str.length + ((len || 2) - 1) * tmp.length;
	},
	// 这里的maxlen是最大字节数，干函数用于按最大字节数截取字符串
	getMaxlen: function (str, maxlen) {
		var sResult = '',
			L = 0,
			i = 0,
			stop = false,
			sChar;
		if (str.replace(/[\u4e00-\u9fa5]/g, 'xxx').length <= maxlen) return str;
		while (!stop) {
			sChar = str.charAt(i);
			L += sChar.match(/[\u4e00-\u9fa5]/) !== null ? 3 : 1;
			if (L > maxlen) {
				stop = true;
			} else {
				sResult += sChar;
				i++;
			}
		}
		return sResult;
	}
};