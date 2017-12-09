$.fn.clamp = function (num) {
	//如果浏览器原生支持就用原生
	if (cssSupport('lineClamp')) {
		this.css({
			paddingBottom: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			WebkitBoxOrient: 'vertical',
			display: '-webkit-box',
			WebkitLineClamp: String(num)
		});
		//修复在zepto上的问题
		this.each(function (index, el) {
			this.style.WebkitBoxOrient = 'vertical';
			this.style.boxOrient = 'vertical';
			this.style.WebkitLineClamp = String(num);
			this.style.lineClamp = String(num);
		});
		return;
	}

	//触发BFC,为了应对图文混排的情况
	this.css({
		overflow: 'hidden',
		display: 'block'
	});

	var tmpObj = this[0];
	//获取fontSize,letterSpacing,innerWidth
	var tmpfz = parseInt($(tmpObj).css('fontSize'));
	var tmpls = parseInt($(tmpObj).css('letterSpacing'));
	var tmpti = parseInt($(tmpObj).css('textIndent'));
	var tmpW = parseFloat($(tmpObj).innerWidth()) - parseFloat($(tmpObj).css('paddingLeft')) - parseFloat($(tmpObj).css('paddingRight'));
	var tmpNum = Math.floor(tmpW / (tmpfz + tmpls)) * num - 3 - Math.ceil(tmpti / tmpfz); //预判的截取字数

	//获取h
	var tmpArr = [];
	for (var i = 0; i < num; i++) {
		tmpArr[i] = '我';
	}
	var tmpHtml = tmpArr.join('<br>');
	var tmpDiv = $('<div></div>').css({
		width: tmpW,
		fontFamily: $(tmpObj).css('fontFamily'),
		fontSize: $(tmpObj).css('fontSize'),
		fontWeight: $(tmpObj).css('fontWeight'),
		fontStyle: $(tmpObj).css('fontStyle'),
		fontVariant: $(tmpObj).css('fontVariant'),
		lineHeight: !tmpObj.style.lineHeight ? 'normal' : tmpObj.style.lineHeight,
		textAlign: $(tmpObj).css('textAlign'),
		wordWrap: $(tmpObj).css('wordWrap'),
		overflowWrap: $(tmpObj).css('overflowWrap'),
		wordSpacing: $(tmpObj).css('wordSpacing'),
		letterSpacing: $(tmpObj).css('letterSpacing'),
		textIndent: $(tmpObj).css('textIndent'),
		position: 'fixed',
		top: 0,
		left: 0,
		padding: 0,
		border: 0,
		visibility: 'hidden'
	}).html(tmpHtml).appendTo(document.body);
	var h = parseFloat(tmpDiv.css('height'));

	//循环每一个元素
	this.each(function () {
		//删除左右两边的空格换行缩进
		var txt = $(this).html().replace(/<((?:.|\s)*?>)|\s/g, '');
		//获取包含内容的实际高度
		var tmpH = parseFloat($(this).innerHeight()) - parseFloat($(this).css('paddingTop')) - parseFloat($(this).css('paddingBottom'));
		//打印实际高度和限定高度
		//console.log(tmpH,h);
		//如果没有超出，不揭断，直接返回
		if (tmpH <= h) {
			return true;
		}
		var $div = tmpDiv.clone().appendTo(document.body);
		$div.html(txt.substring(0, tmpNum));
		var key = true,
			n = 0;
		for (var i = tmpNum, l = txt.length; i < l; i++) {
			if (!key) {
				break;
			}
			(function (i) {
				$div.html($div.html() + txt.charAt(i));
				if (parseInt($div.css('height')) > h) {
					key = false;
					n = i;
					$div.remove();
				}
			})(i);
		}
		//console.log(tmpNum,n);
		if (n !== 0) {
			$(this).html(txt.substring(0, n - 1) + '…');
		} else {
			$(this).html(txt);
		}
	});
};
/*使用:
 *$('selector').clamp(3);
 */