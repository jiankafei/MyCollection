/*第一种*/
$(function () {
	var form = document.formAdd;
	var $text = $('form input.required');
	var join = document.querySelector('#join');
	//输入
	var $cityName = $('#city input');
	var $area = $('#area input');
	var $community = $('#community input');
	var $vCode = $('#vcode input');
	var reg = /^\s?[\u4e00-\u9fa5]+\s?$/;
	//失焦判断
	$('input.required').on('blur', function (ev) {
		verify(this, reg);
	});
	//提交判断
	join.addEventListener('click', function (ev) {
		var ev = ev || event;
		ev.preventDefault();
		for (var i = 0, l = $text.length; i < l; i++) {
			verify($text[i], reg, this);
		};
		//alert(this.getAttribute('data-error'));
		if (this.getAttribute('data-error') === 'false') {
			form.submit();
		}
	}, false);
	//验证函数
	function verify(obj, reg, sub) {
		if (!obj.value) {
			sub && $(sub).attr('data-error', 'true');
			$(obj).parents('section').addClass('error');
			switch (obj.name) {
				case 'city':
					$(obj).next().text('请填写您所在的城市');
					break;
				case 'area':
					$(obj).next().text('请填写您所在的辖区');
					break;
				case 'community':
					$(obj).next().text('请填写您所在的社区');
					break;
				case 'name':
					$(obj).next().text('请填写您的姓名');
					break;
			}
		} else if (!reg.test(obj.value)) {
			sub && $(sub).attr('data-error', 'true');
			$(obj).parents('section').addClass('error');
			$(obj).next().text('您输入的格式有错误');
		} else {
			sub && $(sub).attr('data-error', 'false');
			$(obj).parents('section').removeClass('error');
		}
	};
});

/*第二种*/
document.addEventListener('DOMContentLoaded', function () {
	var aIpt = document.querySelectorAll('.ipt-wp>input'),
		subBtn = document.querySelector('#subBtn'),
		sub = true; //验证是否通过
	/*提交验证*/
	subBtn.addEventListener('touchend', function (event) {
		event.preventDefault();
		verify(aIpt);
	}, false);
	/*失焦判断*/

	/*验证判断*/
	function verify(aIpt) {
		sub = true;
		for (var i = 0, l = aIpt.length; i < l; i++) {
			var ipt = aIpt[i];
			if (ipt.required) {
				if (!ipt.value) {
					sub = false;
					iptError(ipt.parentNode, 'emptyError');
				} else if (ipt.pattern && !patternVerify(ipt)) {
					sub = false;
					iptError(ipt.parentNode, 'formatError');
				}
			}
		}
		if (sub) {
			document.applyForm.submit();
		}
	};
	/*格式验证*/
	function patternVerify(ipt) {
		var pattery = ipt.getAttribute('pattern'),
			regExp = eval('/' + pattery + '/'),
			val = ipt.value;
		return regExp.test(val);
	};
	/*添加错误提示*/
	function iptError(obj, error) {
		var ipt = obj.querySelector('input'),
			tips = obj.querySelector('.errorTips');
		obj.classList.add(error);
		ipt.blur();
		if (error === 'emptyError') {
			obj.addEventListener('webkitAnimationEnd', function () {
				this.classList.remove(error);
			}, false);
			obj.addEventListener('mozAnimationEnd', function () {
				this.classList.remove(error);
			}, false);
			obj.addEventListener('animationend', function () {
				this.classList.remove(error);
			}, false);
		} else if (error === 'formatError') {
			tips.innerHTML = ipt.getAttribute('data-formaterror');
		}
	};
	/*发送验证码*/
	var getMsgBtn = document.querySelector('#getMsgBtn'),
		tel = document.applyForm.elements.username,
		imgIpt = document.applyForm.elements.verify,
		outed = true;
	getMsgBtn.addEventListener('touchend', function (event) {
		event.preventDefault();
		if (!outed) return;
		outed = false;
		if (!tel.value || !imgIpt.value) {
			outed = true;
			alert('手机号或图形验证码未填写');
		} else if (tel.value && imgIpt.value) {
			$.ajax({
				url: '/Login/sendVerifyNum',
				type: 'post',
				data: {
					type: 'login',
					username: tel.value,
					verify: imgIpt.value
				},
				success: function (data) {
					var data = JSON.parse(data);
					if (~~data.code === 200) {
						countdown(getMsgBtn, 60, function () {
							outed = true;
						});
					} else {
						alert(decodeURIComponent(data.message));
						outed = true;
					}
				},
				error: function () {
					outed = true;
					alert('您的网络开小差了！');
				}
			});
		}
	}, false);
	/*倒计时*/
	function countdown(obj, num, cb) {
		var n = num;
		obj.timer = setInterval(function () {
			obj.innerHTML = --n + 's 后重试';
			if (n <= 0) {
				clearInterval(obj.timer);
				obj.innerHTML = '重新获取';
				cb();
			}
		}, 1000);
	};
	/*聚焦去掉状态*/
	for (var i = 0, l = aIpt.length; i < l; i++) {
		(function (i) {
			aIpt[i].addEventListener('focus', function () {
				this.parentNode.classList.remove('formatError');
			});
		})(i);
	}
	//防止form元素点击提交表单
	document.applyForm.addEventListener('click', function (event) {
		event.preventDefault();
	});
}, false);