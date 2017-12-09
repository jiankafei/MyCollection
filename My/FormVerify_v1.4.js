/*表单验证
*json={
    form:,//原生表单对象,必填
    requiredSel:,//需要验证的表单对象的选择器
    errorClassName:,//表单错误时的类名，默认为iptError,添加在input的父元素上
    rightClassName:,//表单正确时的类名，默认为iptRight,添加在input的父元素上
    notRequiredClassName:,//非必填表单类名，默认为onlyvrf
    statusTipSel:,//状态提示的选择器，默认为.statusTip
    wordsLmtSel:,//字数限制表单选择器
    wordsNumSel:,//字数提示元素选择器
    doublePWSel:,//注册时的两个密码框选择器，默认为.doublePW
    submitBtn:,//提交按钮，默认为form里的提交按钮
    offsetTop:,//字段定位偏移量，目前只有top
    lbBtn:,//地图按钮
    nicknameVerify:{//昵称验证
        obj:,
        ajaxOpts:{
            url:,
            type:,//默认post
            dataType:,
            data:{}//一些默认数据
        },
        dynamicData:{
            //一些需要动态获取的数据，都是元素选择器
        },
        isOk:function(data){}//返回值判断函数
    }
    imgVerifyCode:{//图片验证码
        obj:,//表单选择器 或 jq对象 或 原生对象
        ajaxOpts:{
            url:,
            type:,//默认post
            dataType:,
            data:{}//一些默认数据
        },
        dynamicData:{
            //一些需要动态获取的数据，都是元素选择器
        },
        isOk:function(data){}//返回值判断函数
    },
    smsVerifyCode:{//短信验证码
        obj:,//表单选择器 或 jq对象 或 原生对象
        phone:,//电话号码选择器 或 jq对象 或 原生对象
        imgvfcObj:,//图片验证码选择器 或 jq对象 或 原生对象
        sendBtn:,//发送验证码按钮选择器 或 jq对象 或 原生对象
        sendOpts:{
            url:,
            type:,
            dataType:,
            data:{}//一些默认数据
        },
        dynamicSendData:{
            //一些需要动态获取的数据，都是元素选择器
        },
        ajaxOpts:{
            url:,
            type:,//默认post
            dataType:,
            data:{}//一些默认数据
        },
        dynamicData:{
            //一些需要动态获取的数据，都是元素选择器
        },
        sendIsOk:function(data){},//发送，返回值判断函数
            //注意在sendIsOk函数里:
                正确返回 true;
                错误返回 false;
                超限返回 'overrun';
        isOk:function(data){}//返回值判断函数
    },
    ajaxSub:{//ajax提交
        opts:{参数,不需要传递表单数据
            url:,
            type:,
            dataType:
        },
        done:function(data){},
        fail:function(){}
    },
    start:function(){},//把有关系的字段判断函数放在这里
    end:function(){}//点击提交之后需要执行的函数
}
*外部方法：
.blur()//失焦判断
.subb()//提交判断
.wordLimit()//字数统计和限制
.sendSms()//发送短信验证码方法
注：
*字数限制需要设置data-max:最大字数
*上传图片需要设置data-form="id"指向上传图片表单,是个id选择器或原生对象
*data-unfill:未填写时的提示框;
*data-formaterror:格式错误时的提示
*data-passed:格式正确时的提示
*data-pattern:验证，包括doublePW,img,coord,正则,contact,正则&&contact,imgvfc,正则&&imgvfc,smsvfc,正则&&smsvfc,username,正则&&username
*双密码框中，第一个的data-pattern是正则验证，第二个的data-pattern是doublePW
*只需验证的表单需要写入'onlyvrf'class名
*有字段变动时，则使该字段的disabled为true即可
*短信验证码表单需要设置data-tel="id"属性指向电话表单，是个id选择器或原生对象
*用户名，图片验证码，短信验证码的data-pattern里如果有正则，用空格隔开，不分先后
*对于有依赖关系的表单项：
1.需要在data-pattern里写上contact，它和正则以空格隔开就行，不分前后;
2.需要写上data-act.然后把额外的验证函数写在start函数里，额外的验证函数会改变data-act的值，如果条件通过则为true，未通过则为false;

常用的正则验证：
//汉字字母数字括号：
/^([\u4e00-\u9fa5]|[a-zA-Z]|\s|\(|\)|\[|\])+$/
密码：数字字母共存8-16位
/^(?=\w)\w{8,16}$/
汉字：
/^[\u4e00-\u9fa5]+$/
手机：
/^1[2-8]\d{9}$/
电话：
/^[\d-]+$/
邮箱：
/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/i
/^\w[\w\.\_\-]*\w+@\w[\w\.\_\-]*\w+\.\w+$/i 原创
*/
function FormVerify(json) {
	if (!json.form) return;
	this.json = json;
	this.form = json.form;
	if (this.json.requiredSel) {
		this.obj = $(this.json.form).find(this.json.requiredSel);
	} else {
		this.obj = $(this.json.form.elements);
	}
	//input表单的错误类名
	this.errorClassName = json.errorClassName || 'iptError';
	//input表单的正确类名
	this.rightClassName = json.rightClassName || 'iptRight';
	//非必填项类名
	this.notRequired = json.notRequiredClassName || 'onlyvrf';
	//获取状态提示元素类名
	this.statusSel = json.statusTipSel || '.statusTip';
	//昵称验证
	this.nicknameVerify = json.nicknameVerify || null;
	//图片验证码
	this.imgVerifyCode = json.imgVerifyCode || null;
	//短信验证码
	this.smsVerifyCode = json.smsVerifyCode || null;
	//是否正确的数组,0表示错误，1表示正确
	this.isReady = [];
	for (var i = 0, l = this.obj.length; i < l; i++) {
		this.isReady[i] = 0;
	}
	//表单定位偏移量
	this.offsetTop = json.offsetTop || 20;
	//保存字段的位置
	this.posArr = [];
	for (var i = 0; i < this.obj.length; i++) {
		this.posArr.push(this.obj.eq(i).offset());
	};
	if (json.doublePWSel) {
		//获取双密码框
		this.doublePW = $(json.form).find(json.doublePWSel);
	};
	//获取字数限制表单元素和文字个数显示元素
	if (json.wordsLmtSel) {
		this.wordsLmt = $(json.form).find(json.wordsLmtSel);
	};
	this.wordsNum = json.wordsNumSel || '';
	//坐标
	if (json.lbBtn) {
		this.lbBtn = $(json.form).find(json.lbBtn);
	};
	//设置提交按钮，默认为当前表单的提交按钮
	if (json.submitBtn) {
		this.subBtn = $(json.submitBtn);
	} else {
		this.subBtn = $(json.form).find('input[type=submit]'); //默认
	}
	this.ajaxSub = json.ajaxSub;
	this.isload = false; //ajax是否在提交
	this.nickIsOk = false; //用户名是否ok
	this.imgvfcIsOk = false; //图片验证码是否ok
	this.start = json.start;
	json.start && json.start();
	this.end = json.end;
	this.focus();
};
//聚焦清除
FormVerify.prototype.focus = function () {
	var _this = this;
	this.obj.focus(function () {
		$(this).parent().removeClass(_this.errorClassName + ' ' + _this.rightClassName);
	});
	return this;
};
//失焦判断
FormVerify.prototype.blur = function () {
	var _this = this;
	this.obj.each(function (index) {
		$(this).blur(function () {
			_this.verify(this, index, false);
			console.log(this, index);
		});
	});
	return this;
};
//提交判断
//注意，在click里不能使用this.form来获取form，只能使用_this.form来获取，因为subBtn可能不是该表单的submit按钮。这主要是考虑到IE等低级浏览器不支持form属性
FormVerify.prototype.subb = function () {
	var _this = this;
	this.subBtn.click(function (event) {
		event.preventDefault();
		_this.start && _this.start();
		//判断,true表示提交判断
		_this.obj.each(function (index) {
			_this.verify(this, index, true);
		});
		//错误表单定位
		for (var i = 0; i < _this.isReady.length; i++) {
			if (!_this.isReady[i]) {
				//_this.obj[i].focus();//不再自动聚焦
				//end函数
				_this.end && _this.end();
				$('html,body').stop().animate({
					scrollTop: _this.posArr[i].top - _this.offsetTop
				});
				return _this;
			}
		};
		//密码加密
		var $ps = $(_this.form).find('input[type="password"]');
		$ps.each(function () {
			$(this).val(hex_md5($(this).val()));
		});
		//提交
		if (_this.ajaxOpts) {
			if (_this.isload) {
				return _this;
			};
			_this.isload = true;
			_this.ajaxSub.opts.data = $(_this.form).serialize();
			$.ajax(_this.ajaxSub.opts)
				.done(function (data) {
					_this.isload = false;
					_this.ajaxSub.done && _this.ajaxSub.done(data);
				})
				.fail(function () {
					_this.isload = false;
					_this.ajaxSub.fail && _this.ajaxSub.fail();
				});
		} else {
			_this.form.submit();
		}
	});
	return this;
};
//发送短信验证码按钮点击
FormVerify.prototype.sendSms = function () {
	var _this = this,
		vfc = this.smsVerifyCode,
		$obj = $(vfc.obj),
		$statusSel = $(vfc.obj).siblings(this.statusSel), //状态提示
		$phone = $(vfc.phone),
		$imgvfcObj = $(vfc.imgvfcObj),
		$sendBtn = $(vfc.sendBtn),
		sendData = vfc.sendOpts.data,
		dynamicSendData = vfc.dynamicSendData,
		$errorClassName = this.errorClassName,
		$rightClassName = this.rightClassName;
	this.isOver = false; //发送数量是否超限
	$sendBtn.attr('disabled', 'disabled').css('cursor', 'not-allowed');
	$sendBtn.on('click', (function () {
		var key = false; //是否在发送
		return function () {
			if (_this.isOver) {
				return false;
			}
			var _this_ = this;
			if (!/^1[2-8]\d{9}$/.test($phone.val())) {
				var status = $phone.siblings(_this.statusSel);
				status && status.html('手机号格式错误或未填写')
				$phone.parent().removeClass($rightClassName).addClass($errorClassName);
				return false;
			}
			if (!/^\d{4}$/.test($imgvfcObj.val())) {
				var status = $imgvfcObj.siblings(_this.statusSel);
				status && status.html('图片验证码不正确或未填写');
				$imgvfcObj.parent().removeClass($rightClassName).addClass($errorClassName);
				return false;
			}
			if (!key) {
				key = true;
				//添加发送动态数据
				for (var i in dynamicSendData) {
					sendData[i] = $(dynamicSendData[i]).val();
				}

				//发送
				$(_this_).text('发送中···');
				$.ajax(vfc.sendOpts)
					.done(function (data) {
						console.log(decodeURIComponent(data), vfc.sendIsOk(data));
						var res = true;
						switch (vfc.sendIsOk(data)) {
							case 'overrun':
								$(_this_).text("今日超限").attr('disabled', 'disabled').css('cursor', 'not-allowed');
								$statusSel && $statusSel.html('今日发送验证码超过限制');
								$obj.parent().removeClass($rightClassName).addClass($errorClassName);
								_this.isOver = true;
								key = false;
								res = false;
								break;
							case false:
								$(_this_).text("重新获取").removeAttr("disabled").css('cursor', 'pointer');
								$statusSel && $statusSel.html('发送失败');
								$obj.parent().removeClass($rightClassName).addClass($errorClassName);
								key = false;
								res = false;
								break;
						}
						if (!res) {
							return false;
						}
						$(_this_).text('60s后重试');
						$obj.focus();
						$(_this_).attr('disabled', 'disabled').css('cursor', 'not-allowed');
						var delay = 60;
						var timer = setInterval(function () {
							$(_this_).text(--delay + 's后重试');
							if (delay === 0) {
								clearInterval(timer);
								$(_this_).text('重新获取').removeAttr('disabled').css('cursor', 'pointer');
								key = false;
							}
						}, 1000);
					})
					.fail(function () {
						$(_this_).text('重新获取').removeAttr('disabled').css('cursor', 'pointer');
						key = false;
					});
			}
		};
	})());
	return this;
};
//验证
FormVerify.prototype.verify = function (item, now, issubb) {
	var now = now;
	console.log(now);
	var _this = this;
	var $errorClassName = _this.errorClassName;
	var $rightClassName = _this.rightClassName;
	var $statusSel = $(item).siblings(this.statusSel); //状态提示
	var $unfillTip = $(item).attr('data-unfill') || '请填写该项'; //未填写提示语
	var $formatErrorTip = $(item).attr('data-formaterror') || '格式错误'; //格式错误提示语
	var $passedTip = $(item).attr('data-passed') || ''; //格式正确提示语
	var $errorImg = $($(item).attr('data-form')).find(_this.statusSel);
	var $val = $(item).val(); //字段值
	var $reg = $(item).attr('data-pattern'); //验证类型
	var $act = $(item).attr('data-act'); //行为结果，布尔值
	if ($val) { //有值验证
		if (/^\/.+\/(g|i|u){0,3}$/.test($reg)) { //正则
			sh(eval($reg));
		} else if (/(imgvfc)/.test($reg)) { //图片验证码
			imgvfc($reg);
		} else if (/(smsvfc)/.test($reg)) { //短信验证码
			smsvfc($reg);
		} else if (/(username)/.test($reg)) { //用户名验证
			username($reg);
		} else if (/(contact)/.test($reg)) { //关系
			ct($reg);
		} else if ($reg === 'doublePW') { //双密码
			pwagain();
		} else if ($reg === 'img') { //图片
			$errorImg && ($errorImg.hide());
			_this.isReady[now] = 1;
		} else if ($reg === 'coord') { //地图定位
			_this.isReady[now] = 1;
		} else { //其他
			testRt();
		}
	} else { //空值提示
		if (issubb) {
			if ($reg == 'img') { //没上传图片
				$errorImg && ($errorImg.show());
				_this.isReady[now] = 0;
				(function (item, er) {
					item.timer = setInterval(function () {
						if ($(item).val()) {
							er && (er.hide());
							clearInterval(item.timer);
						};
					}, 500);
				})(item, $errorImg);
			} else if ($reg == 'coord') { //地图没有定位
				var n = 0;
				var timer = setInterval(function () {
					n++;
					if (n % 2 == 0) {
						_this.lbBtn && _this.lbBtn.css({
							color: 'red'
						});
					} else {
						_this.lbBtn && _this.lbBtn.css({
							color: 'black'
						});
					};
					if (n == 8) {
						clearInterval(timer);
					};
				}, 100);
				_this.isReady[now] = 0;
			} else if ($(item).prop('disabled')) { //忽略项
				testRt('isNull');
			} else { //其他
				testWr('isNull');
			}
		}
		if ($(item).hasClass(_this.notRequired)) { //非必填项
			testRt('isNull');
		};
	}
	//正则判断
	function sh(reg) {
		if (reg.test($val)) { //正则验证正确
			testRt();
		} else { //正则验证错误
			testWr();
		}
	};
	//用户名验证
	function username(reg) {
		var regArr = reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/),
			reg = regArr ? eval(reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/)[0]) : null,
			vfc = _this.nicknameVerify,
			data = vfc.ajaxOpts.data,
			dynamicData = vfc.dynamicData,
			$sendBtn = $(_this.smsVerifyCode.sendBtn);
		//添加动态数据
		for (var i in dynamicData) {
			data[i] = $(dynamicData[i]).val();
		}
		if (reg) {
			if (reg.test($val)) {
				!issubb && ajaxReq();
			} else {
				testWr();
				_this.nickIsOk = false;
				$sendBtn.attr('disabled', 'disabled').css('cursor', 'not-allowed');
			}
		} else {
			!issubb && ajaxReq();
		}

		function ajaxReq() {
			$.ajax(vfc.ajaxOpts)
				.done(function (data) {
					if (vfc.isOk(data)) {
						testRt();
						_this.nickIsOk = true;
						if (_this.imgvfcIsOk) {
							$sendBtn.removeAttr('disabled').css('cursor', 'pointer');
						}
					} else {
						testWr('registed');
						_this.nickIsOk = false;
						$sendBtn.attr('disabled', 'disabled').css('cursor', 'not-allowed');
					}
				})
				.fail(function () {
					alert('亲，网络有问题哦');
				})
		};
	};
	//图片验证码
	function imgvfc(reg) {
		var regArr = reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/),
			reg = regArr ? eval(reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/)[0]) : null,
			vfc = _this.imgVerifyCode,
			data = vfc.ajaxOpts.data,
			dynamicData = vfc.dynamicData,
			$sendBtn = $(_this.smsVerifyCode.sendBtn);
		//添加动态数据
		for (var i in dynamicData) {
			data[i] = $(dynamicData[i]).val();
		}
		var $obj = $(vfc.obj);
		if (reg) {
			if (reg.test($val)) {
				!issubb && ajaxReq();
			} else {
				testWr();
				_this.imgvfcIsOk = false;
				$sendBtn.attr('disabled', 'disabled').css('cursor', 'not-allowed');
			}
		} else {
			!issubb && ajaxReq();
		}

		function ajaxReq() {
			$.ajax(vfc.ajaxOpts)
				.done(function (data) {
					if (vfc.isOk(data)) {
						testRt();
						_this.imgvfcIsOk = true;
						if (!_this.isOver && _this.nickIsOk) {
							$sendBtn.removeAttr('disabled').css('cursor', 'pointer');
						}
					} else {
						testWr();
						_this.imgvfcIsOk = false;
						$sendBtn.attr('disabled', 'disabled').css('cursor', 'not-allowed');
					}
				})
				.fail(function () {
					alert('亲，网络有问题哦');
				})
		};
	};
	//短信验证码验证
	function smsvfc(reg) {
		var regArr = reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/),
			reg = regArr ? eval(reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/)[0]) : null,
			vfc = _this.smsVerifyCode,
			data = vfc.ajaxOpts.data,
			dynamicData = vfc.dynamicData;
		//添加动态数据
		for (var i in dynamicData) {
			data[i] = $(dynamicData[i]).val();
		}

		if (reg) {
			if (reg.test($val)) {
				!issubb && ajaxReq();
			} else {
				testWr();
			}
		} else {
			!issubb && ajaxReq();
		}

		function ajaxReq() {
			$.ajax(vfc.ajaxOpts)
				.done(function (data) {
					if (vfc.isOk(data)) {
						testRt();
					} else {
						testWr();
					}
				})
				.fail(function () {
					alert('亲，网络有问题哦');
				})
		};
	};
	//条件验证
	function ct(reg) {
		var regArr = reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/);
		var reg = regArr ? eval(reg.match(/\s?\/.+\/(g|i|u){0,3}\s?/)[0]) : null;
		if (reg) {
			if (reg.test($val)) { //正则验证正确
				if ($act === 'true') { //条件符合
					testRt();
				} else if ($act === 'false') { //条件不符合
					testWr();
				}
			} else { //正则验证错误
				testWr();
			}
		} else {
			if ($act === 'true') { //条件符合
				testRt();
			} else if ($act === 'false') { //条件不符合
				testWr();
			}
		}
	};
	//双密码框值相同判断
	function pwagain() {
		var $pw = _this.doublePW;
		if ($pw.eq(0).val() != $pw.eq(1).val()) {
			testWr();
		} else {
			testRt();
		}
	};

	function testRt(par) { //验证正确
		if (par === 'isNull') {
			$(item).parent().removeClass($errorClassName + ' ' + $rightClassName);
		} else {
			$(item).parent().removeClass($errorClassName).addClass($rightClassName);
		}
		if ($statusSel) {
			$statusSel.html($passedTip);
		}
		_this.isReady[now] = 1;
		console.log(_this.isReady, now);
	};

	function testWr(par) { //验证错误
		$(item).parent().removeClass($rightClassName).addClass($errorClassName);
		if ($statusSel) {
			if (par === 'isNull') {
				$statusSel.html($unfillTip);
			} else if (par === 'registed') {
				$statusSel.html('该用户名已被注册');
			} else {
				$statusSel.html($formatErrorTip);
			}
		}
		_this.isReady[now] = 0;
		console.log(_this.isReady, now);
	};
};
//input字数限制判断
FormVerify.prototype.wordLimit = function () {
	if (!this.wordsLmt) {
		return this;
	}
	var _this = this;
	var now = 0;
	var arr = [];
	for (var i = 0, l = this.wordsLmt.length; i < l; i++) {
		var item = $(this.wordsLmt[i]);
		var max = item.attr('data-max') - 0;
		arr.push(max);
		//初始化字数显示元素的字数
		(this.wordsNum) && (item.siblings(this.wordsNum).html(Str.byteLen(item.val(), 3) / 3 + '/' + max));
	};
	for (var i = 0, l = (this.wordsLmt).length; i < l; i++) {
		(function (index) {
			_this.wordsLmt.eq(i).on('input propertychange', function () {
				var total = arr[index];
				//中文输入过程中不截断
				if ($(this).prop('comStart')) return false;
				//实时显示字数个数
				var value = $(this).val();
				var nowLen = Str.byteLen(value, 3);
				(_this.wordsNum) && ($(this).siblings(_this.wordsNum).html(Math.floor(nowLen / 3) + '/' + total / 3));
				//截断
				if (nowLen > total) {
					$(this).val(Str.getMaxlen(value, total));
					(_this.wordsNum) && ($(this).siblings(_this.wordsNum).html(total / 3 + '/' + total / 3));
				}
			}).on('compositionstart', function () {
				$(this).prop('comStart', true);
				console.log('中文输入：开始');
			}).on('compositionend', function () {
				$(this).prop('comStart', false);
				console.log('中文输入：结束');
			});
		})(i);
	};
	return this;
};