/*
*jQuery —— alert confirm 插件
注意：
该插件一定要放在尾部，也就是body结束标签的前面,因为要添加到body里，然后调用的js要写在它的后面
使用：
在要执行的事件内，写al或cf函数即可
*/
(function ($) {
	$(document).css('height', '100%');
	$(document.body).css('height', '100%');
	$('<div style="visibility: hidden;width: 100%;height: 100%;position: fixed;top: 0;left: 0;z-index: 99999;font-family: Microsoft Yahei; filter: alpha(opacity=0); opacity: 0;-ms-transform: scale(10);-webkit-transform: scale(10);transform: scale(10);-ms-transition: all 0.35s cubic-bezier(0.38, 1.02, 0.46, 0.99);-webkit-transition: all 0.35s cubic-bezier(0.38, 1.02, 0.46, 0.99);transition: all 0.35s cubic-bezier(0.38, 1.02, 0.46, 0.99);" id="cpm">\
		<div class="gl" style="position: absolute;top: 0;left: 0;background-color: #000; opacity: 0.3; filter: alpha(opacity=30);width: 100%;height: 100%;z-index: -1;"></div>\
		<div class="al" style="visibility: hidden;position: absolute;top: 200px;left: 50%;margin-left: -100px;padding-bottom:31px;width: 200px;background-color: #fff;border-radius: 10px;">\
			<div style="padding: 20px;text-align: center;" class="al_ct"></div>\
			<a href="javascript:;" class="al_btn" style="display: block;position: absolute;width: 100%;bottom: 0;left: 0;height: 30px;line-height: 30px;text-align: center;border-top: 1px solid #ccc;text-decoration: none;color: #0dad51;letter-spacing: 1px;">确认</a>\
		</div>\
		<div class="cf" style="visibility: hidden;position: absolute;top: 200px;left: 50%;margin-left: -100px;padding-bottom:31px;width: 200px;background-color: #fff;border-radius: 10px;">\
			<div style="padding: 20px;text-align: center;" class="cf_ct"></div>\
			<div style="position: absolute;bottom: 0;left: 0;width: 100%;overflow: hidden;">\
				<a href="javascript:;" class="cf_no" style="float: left;display: block;width: 50%;height: 30px;line-height: 30px;text-align: center;border-top: 1px solid #ccc;text-decoration: none;color: #0dad51;letter-spacing: 1px;">取消</a>\
				<a href="javascript:;" class="cf_yes" style="float: right;display: block;width: 50%;height: 30px;line-height: 30px;text-align: center;margin-left: -1px;border-top: 1px solid #ccc;border-left: 1px solid #ccc;text-decoration: none;color: #0dad51;letter-spacing: 1px;">确定</a>\
			</div>\
		</div>\
	</div>').appendTo(document.body);
})(jQuery);

/*
 *alert弹框
 */
function al(str, fn) {
	$('.al .al_ct').html(str);
	$('.al').css('visibility', 'visible');
	$('#cpm').css({
		'visibility': 'visible',
		'filter': 'alpha(opacity=100)',
		'opacity': '1',
		'MsTransform': 'scale(1)',
		'WebkitTransform': 'scale(1)',
		'transform': 'scale(1)'
	});
	$('.al .al_btn').click(function () {
		$('#cpm').css({
			'visibility': 'hidden',
			'filter': 'alpha(opacity=0)',
			'opacity': '0',
			'MsTransform': 'scale(10)',
			'WebkitTransform': 'scale(10)',
			'transform': 'scale(10)'
		});
		fn && fn();
		var timer = setInterval(function () {
			if ($('#cpm').css('opacity') == '0') {
				$('.al').css('visibility', 'hidden');
				clearInterval(timer);
			};
		}, 100);
	});
};
/*
confirm弹框:
四个参数:
obj:触发弹窗的对象;
str:弹出的字符串;
fnYes:点击确定时执行的函数;
fnNo:点击取消时执行的函数;
注意:
如果相应参数没有，则传入null;
两个函数都有obj对象，也就是触发弹窗的对象;
*/
function cf(obj, str, fnYes, fnNo) {
	if (obj) {
		$(obj).on('click', function (event) {
			event.preventDefault();
		});
	}
	$('.cf .cf_ct').html(str);
	$('.cf').css('visibility', 'visible');
	$('#cpm').css({
		'visibility': 'visible',
		'filter': 'alpha(opacity=100)',
		'opacity': '1',
		'MsTransform': 'scale(1)',
		'WebkitTransform': 'scale(1)',
		'transform': 'scale(1)'
	});
	$('.cf_no').click(function () {
		hides();
		fnNo && fnNo(obj);
	});
	$('.cf_yes').click(function () {
		hides();
		fnYes && fnYes(obj);
	});

	function hides() {
		$('#cpm').css({
			'visibility': 'hidden',
			'filter': 'alpha(opacity=0)',
			'opacity': '0',
			'MsTransform': 'scale(10)',
			'WebkitTransform': 'scale(10)',
			'transform': 'scale(10)'
		});
		var timer = setInterval(function () {
			if ($('#cpm').css('opacity') == '0') {
				$('.cf').css('visibility', 'hidden');
				clearInterval(timer);
			};
		}, 100);
	};
}