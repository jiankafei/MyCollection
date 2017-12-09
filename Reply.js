;
(function (G) {
	/**
	 * 移动端使用
	{
		holderText: '', //占位文字
		textField: '', //发送内容字段名
		ajaxOption: {}, //ajax选项
		status: function(){}, //返回状态
		done: function(){}, //成功回掉
		fail: function(){}, //失败回掉
		updataHolderText: function(){}, //更新holderText
		updataAjaxData: function(fn){ //更新ajax数据
			fn(this.ajaxOption.data);
		},
		cancleSend: function(){}, //取消发送
	}
	对外接口：
		show();
		hide();
		updataHolderText(str);
		updataAjaxData(fn);
		area //内容框
	 */
	function Reply(params) {
		if (!params.ajaxOption.url || !params.textField || params.status === undefined) return;
		this.textField = params.textField;
		this.holderText = params.holderText || '';
		this.ajaxOption = params.ajaxOption || {};
		this.isAjax = false;
		this.status = params.status;
		this.done = params.done || null;
		this.fail = params.fail || null;
		this.cancleSend = params.cancleSend || null;
		this.init();
	}
	Reply.prototype.init = function () {
		addStylesheetRules('#reply{position: fixed;top: 0;left: 0;right: 0;bottom: 0;background-color: transparent;font-size: .24rem;z-index: 99999;}\
							#reply.hide{display: none !important;}\
							#replyBack{background-color: rgba(0,0,0,.4);}\
							#reply .replyBox{min-height: 1rem;padding: .166rem;box-sizing: border-box;border-top: 1px solid #d2d2d2;background-color: #fff;}\
							#area{padding: .076rem .18rem;line-height: .5rem;text-align: justify;font-size: .32rem;background-color: #fff;border: 0;border-bottom: 1px solid #1aad19;overflow-y: auto;-webkit-overflow-scrolling: touch;transition: all 200ms;-webkit-appearance: none;-webkit-appearance: none;border-radius: 0;resize: none;}\
							#area::-webkit-scrollbar{display: none;}\
							#area::placeholder{font-size: .24rem;}\
							#area:focus{outline: 0;}\
							#replyBtn{margin-left: .16rem;line-height: .652rem;padding: 0 .8em;border-radius: .04rem;border: 1px solid #179e16;box-sizing: border-box;color: #fff;background-color: #1aad19;}');
		this.comp = document.createElement('div');
		this.comp.id = 'reply';
		this.comp.className = 'flex-box flex-col hide fixed';
		this.comp.innerHTML = '<div id="replyBack" class="flex-1"></div>\
								<div class="replyBox flex-none flex-box flex-alignItem-end">\
									<textarea id="area" rows="6" placeholder="' + this.holderText + '" class="flex-1"></textarea>\
									<div id="analog"></div>\
									<div id="replyBtn" class="flex-none">发送</div>\
								</div>';
		G.document.body.appendChild(this.comp);
		this.area = document.getElementById('area');
		this.bg = document.getElementById('replyBack');
		this.btn = document.getElementById('replyBtn');
		this.control();
	};
	Reply.prototype.show = function () {
		this.comp.classList.remove('hide');
		this.area.focus();
	};
	Reply.prototype.hide = function () {
		this.comp.classList.add('hide');
	};
	Reply.prototype.updataHolderText = function (str) {
		this.holderText = str;
		this.area.setAttribute('placeholder', str);
	};
	Reply.prototype.updataAjaxData = function (fn) {
		fn(this.ajaxOption.data);
	};
	Reply.prototype.control = function () {
		var that = this;
		this.bg.addEventListener('click', function (ev) {
			that.hide();
			document.documentElement.focus();
			that.cancleSend && that.cancleSend(); //取消发送
		}, false);
		this.btn.addEventListener('click', function (ev) {
			if (!that.area.value || that.isAjax) return;
			that.isAjax = true;
			that.ajaxOption.data[that.textField] = that.area.value;
			that.send();
		}, false);
	};
	Reply.prototype.send = function () {
		var that = this;
		ajax({
			url: that.ajaxOption.url,
			method: that.ajaxOption.type || 'get',
			data: that.ajaxOption.data
		}).done(function (data) {
			var status = that.status(data);
			if (status) {
				that.area.value = '';
				that.done && that.done();
			} else {
				alert.warn('发送失败！');
			}
		}).fail(function (err) {
			that.fail && that.fail(err);
		}).end(function () {
			that.isAjax = false;
		});
	};
	G.Reply = Reply;
})(window);