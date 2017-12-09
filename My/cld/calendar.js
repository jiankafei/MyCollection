$(function () {
	var $aCa = $('.calendar .control a');
	var $aYMs = $('.calendar .year span');
	var $oWu = $('.calendar .week ul');
	var $oDu = $('.calendar .date ul');
	var $oFoot = $('.calendar footer');
	var now = 0; //当前月
	//操作
	$aCa.eq(0).click(function () {
		now--;
		calendar();
	});
	$aCa.eq(1).click(function () {
		now = 0;
		calendar();
	});
	$aCa.eq(2).click(function () {
		now++;
		calendar();
	});
	var $oBtn = $('.calendar .year button');
	$oBtn.click(function () {
		var y = $aYMs.eq(0).html(),
			m = $aYMs.eq(1).html();
		if (!y.match(/^[1-9]\d{3}$/)) {
			alert('你可以穿越到古代，但不能穿越到侏罗纪时代或者一万年以后，因为那是电影里才会有的');
			now = 0;
			calendar();
			return;
		};
		if (!m.match(/(^0[1-9]$)|(^1[0-2]$)/)) {
			alert('当你看到这句话时，说明你不是上帝，作为芸芸众生，我们只能生活在[1-12]月区间，请重新输入');
			now = 0;
			calendar();
			return;
		};
		var $oDate = new Date();
		now = (y - $oDate.getFullYear()) * 12 - 0 + (m - $oDate.getMonth() - 1);
		$aYMs.eq(1).html(toDub($aYMs.eq(1).html()));
		calendar();
	});
	//初始化和函数封装
	calendar(); //最重要的是now
	function calendar() {
		$oWu.html('');
		$oDu.html('');
		//处理年月
		var $Date = new Date();
		$Date.setMonth($Date.getMonth() + now, 1);
		var y = $Date.getFullYear(),
			m = $Date.getMonth() + 1;
		$aYMs.eq(0).html(y);
		$aYMs.eq(1).html(toDub(m));
		//处理星期
		var arrWeek = ['一', '二', '三', '四', '五', '六', '日'];
		for (var i = 0; i < 7; i++) {
			$('<li>' + arrWeek[i] + '</li>').appendTo($oWu);
		};
		//处理空格
		var $Date = new Date();
		$Date.setMonth($Date.getMonth() + now, 1);
		var week = $Date.getDay();
		if (week == 0) {
			week = 7
		};
		for (var i = 1; i < week; i++) {
			$('<li>&nbsp;</li>').appendTo($oDu);
		};
		//处理日期
		var $Date = new Date();
		$Date.setMonth($Date.getMonth() + now + 1, 0);
		var numday = $Date.getDate();
		for (var i = 0; i < numday; i++) {
			$('<li><a src="javascript:;">' + (i + 1) + '</a></li>').appendTo($oDu);
		};
		//处理颜色
		if (now == 0) {
			var nowday = new Date().getDate();
			$oDu.children().each(function () {
				if ($(this).children().html() == nowday) {
					$(this).children().css({
						'backgroundColor': 'black',
						'color': 'white'
					});
				};
			});
		};
	}

	function toDub(n) {
		return n < 10 ? '0' + n : '' + n;
	}
})