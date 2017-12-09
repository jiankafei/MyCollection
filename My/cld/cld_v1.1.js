/*日历和日期插件*/
/*
用法：
var $cld=$(document.body).cld(ymd,ymdDf);//$cld表示日期选择器控件
*注：
所有的日期都是*_f和*_s这两个类
如果有默认值则再加ymdDf
*/
(function ($) {
	$.fn.cld = function (ymd, ymdDf) {
		var $objs = $('.' + (ymd || 'ymd'));
		var ymdDf = ymdDf || 'ymdDf';
		var yyNow = 0; //当前年
		var now = 0; //当前月
		var yOd = 'dd'; //控制按钮类型
		var who; //判断是那个框
		var initNow = 0; //初始当前月now,自己没有时用对方的
		var oNow = 0; //对方有时用对方的，对方没有时用自己的
		var t; //初始日期
		var o; //对方的值
		//没有日期值时初始化日期
		$objs.val(function () {
			var $date = new Date();
			var v = $(this).val().replace(/(^\s+)|(\s+$)/g, '');
			if ($(this).hasClass(ymdDf) && v === '') {
				return $date.getFullYear() + '-' + ($date.getMonth() + 1) + '-' + $date.getDate();
			}
			return v;
		});

		//阻止冒泡
		$objs.on('click', function (event) {
			event.stopPropagation();
		});
		//只读
		$objs.on('keydown', function () {
			return false;
		});

		//聚焦操作
		$objs.on('focus', function () {
			$cld.css({
				left: $(this).offset().left,
				top: $(this).offset().top + $(this).outerHeight()
			}).show();
			var cld_this = this; //ipt对象
			var cld_val; //日期值
			var $sideVal; //对方值
			var cls = $(this).attr('class');
			if (cls.match(/_f\b/)) {
				who = 'f';
				$sideVal = $('.' + (cls.match(/\b\w+_f\b/))[0].replace(/_f/, '_s')).val();
				if ($sideVal) {
					o = $sideVal.split('-');
				} else {
					o = null;
				}

			} else if (cls.match(/_s\b/)) {
				who = 's';
				$sideVal = $('.' + (cls.match(/\b\w+_s\b/))[0].replace(/_s/, '_f')).val();
				if ($sideVal) {
					o = $sideVal.split('-');
				} else {
					o = null;
				}
			} else {
				who = null;
				o = null;
			}
			if ($(cld_this).val()) {
				cld_val = $(cld_this).val().split('-');
			} else {
				cld_val = o;
			}
			if (cld_this.value === '') {
				var $date = new Date();
				var dataArr = [$date.getFullYear(), $date.getMonth() + 1, $date.getDate()];
				o = dataArr;
				cld_val = dataArr;
			}
			//初始化t
			t = {
				y: parseInt(cld_val[0]),
				m: parseInt(cld_val[1]),
				d: parseInt(cld_val[2])
			};
			//o的值
			if (o) {
				o = {
					y: parseInt(o[0]),
					m: parseInt(o[1]),
					d: parseInt(o[2])
				};
				oNow = (o.y - new Date().getFullYear()) * 12 - 0 + (o.m - new Date().getMonth() - 1);
			};
			//初始now
			initNow = (parseInt(cld_val[0]) - new Date().getFullYear()) * 12 - 0 + (parseInt(cld_val[1]) - new Date().getMonth() - 1);
			//处理日期
			changedd(t);
			ddshow();
			yy();
			mm();
			//设置getTime函数
			$cld.getTime = function (y, m, d) {
				$(cld_this).val(y + '-' + m + '-' + d);
			};
		});
		/*创建元素*/
		var $cld = $('<div id="cld"><div>');
		$(this).append($cld);
		$cld.on('contextmenu', function (event) {
			event.preventDefault();
		});
		var $header = $('<header></header>');
		$cld.append($header);
		var $cld_ct = $('<div class="cld_ct clearfix">\
				<button class="cld_ct_l" title="前"></button>\
				<button class="cld_ct_m" title="回到当前日期"></button>\
				<button class="cld_ct_r" title="后"></button>\
			</div>');
		var $cld_ym = $('<div class="cld_ym clearfix"></div>');
		var $cld_ym_y = $('<button class="cld_ym_y">年</button>');
		var $cld_ym_m = $('<button class="cld_ym_m">月</button>');
		$cld_ym.append($cld_ym_y); //年
		$cld_ym.append($cld_ym_m); //月
		$header.append($cld_ct);
		$header.append($cld_ym);
		var $cld_year = $('<section class="cld_year"></section>');
		$cld.append($cld_year);
		var $cld_month = $('<section class="cld_month"></section>');
		$cld.append($cld_month);
		var $cld_wd = $('<section class="cld_wd"></section>');
		$cld.append($cld_wd);
		var $cld_week = $('<div class="cld_week"><ul class="clearfix"><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li class="cld_wkd">六</li><li class="cld_wkd">日</li></ul></div>'); //星期
		var $cld_date = $('<div class="cld_date"></div>'); //日
		$cld_wd.append($cld_week);
		$cld_wd.append($cld_date);
		var $footer = $('<footer><p></p></footer>');
		$cld.append($footer);
		/*操作1,切换日期操作*/
		$cld_ct.on('click', function (event) {
			event.stopPropagation();
			var tg = event.target;
			if (tg.tagName === 'BUTTON') {
				var $cl = $(tg).attr('class');

				function ct(cl) {
					switch (cl) {
						case 'cld_ct_l':
							if (yOd === 'yy') {
								yyNow--;
								yy();
							} else if (yOd === 'dd') {
								now--;
								dd();
							};
							break;
						case 'cld_ct_m':
							if (yOd === 'yy') {
								yyNow = 0;
								yy();
							} else if (yOd === 'dd') {
								now = initNow;
								dd();
							};
							break;
						case 'cld_ct_r':
							if (yOd === 'yy') {
								yyNow++;
								yy();
							} else if (yOd === 'dd') {
								now++;
								dd();
							};
					};
				};
				ct($cl);
				/*switch(yOd){
					case 'yy':
					ct($cl);
					break;
					case 'dd':
					ct($cl);
					break;
				};*/
			};
		});
		/*操作2，年月点击操作*/
		$cld_ym.on('click', function (event) {
			event.stopPropagation();
			var tg = event.target;
			switch ($(tg).attr('class')) {
				case 'cld_ym_y':
					yOd = 'yy';
					$cld_wd.hide();
					$cld_month.hide();
					$cld_year.show();
					$cld_ct.children().attr('disabled', false).removeClass('cld_disable');
					break;
				case 'cld_ym_m':
					$cld_wd.hide();
					$cld_year.hide();
					$cld_month.show();
					$cld_ct.children().attr('disabled', true).addClass('cld_disable');
					break;
			};
		});
		/*操作3，显示日期操作*/
		$cld.on('click', function (event) {
			event.stopPropagation();
			ddshow();
		})
		$(document).on('click', function (event) {
			$cld.hide();
		})

		//初始化和函数封装
		function yy() {
			$cld_year.html('');
			//处理年
			var $ul = $('<ul class="clearfix"></ul>');
			$ul.on('click', function (event) {
				var tg = event.target;
				if (tg.tagName === 'A') {
					if ($(tg).parent().hasClass('cld_ps')) {
						return false
					};
					var y = $(tg).html();
					$cld_ym_y.html(y + '年');
					ddshow();
					mm();
					changedd({
						y: y,
						m: parseInt($cld_ym_m.html())
					});
				};
			});
			$cld_year.append($ul);

			//元素和颜色
			var y = t.y + yyNow * 15;
			//创建
			for (var i = y - 7; i < y + 8; i++) {
				$('<li><a href="javascript:;">' + i + '</a></li>').appendTo($ul);
			};

			$ul.children().each(function (index, el) {
				var $a = $(this).children();
				//颜色now
				if ($a.html() == t.y - yyNow * 15) {
					$(this).addClass('cld_now');
				};
				//颜色限制
				if (o != null) {
					if (who == 'f') {
						if ($a.html() - 0 > o.y) {
							$(this).addClass('cld_ps');
						};
					} else if (who == 's') {
						if ($a.html() - 0 < o.y) {
							$(this).addClass('cld_ps');
						};
					}
				};
			});
		};

		function mm() {
			//处理月
			$cld_month.html('');
			var $ul = $('<ul class="clearfix"></ul>');
			$ul.on('click', function (event) {
				var tg = event.target;
				if (tg.tagName === 'A') {
					if ($(tg).parent().hasClass('cld_ps')) {
						return false
					};
					var m = $(tg).html();
					$cld_ym_m.html(toDub(m) + '月');
					ddshow();
					changedd({
						y: parseInt($cld_ym_y.html()),
						m: m
					});
				};
			});
			$cld_month.append($ul);
			for (var i = 1; i < 13; i++) {
				$('<li><a href="javascript:;">' + i + '</a></li>').appendTo($ul);
			};
			//颜色
			$ul.children().each(function (index, el) {
				var $a = $(this).children();
				//now
				if ($a.html() == t.m) {
					$(this).addClass('cld_now');
				}
				//颜色限制
				if (o != null) {
					if (o.y === parseInt($cld_ym_y.html())) {
						if (who == 'f') {
							if ($a.html() - 0 > o.m) {
								$(this).addClass('cld_ps');
							};
						} else if (who == 's') {
							if ($a.html() - 0 < o.m) {
								$(this).addClass('cld_ps');
							};
						}
					}
				};
			});
		};
		//最重要的是now
		function dd() {
			$cld_date.html('');
			var $ul = $('<ul class="clearfix"></ul>');
			$ul.on('click', function (event) {
				var tg = event.target;
				if (tg.tagName === 'A') {
					if ($(tg).parent().hasClass('cld_ps')) {
						return false
					};
					if (!/^\s+&/.test($(tg).html())) {
						$cld.getTime(parseInt($cld_ym_y.html()), parseInt($cld_ym_m.html()), $(tg).html());
						$cld.hide(); //插件隐藏
					};
				};
			});
			$cld_date.append($ul);
			//处理年月
			var $Date = new Date();
			$Date.setMonth($Date.getMonth() + now, 1);
			var y = $Date.getFullYear(),
				m = $Date.getMonth() + 1;
			$cld_ym_y.html(y + '年');
			$cld_ym_m.html(toDub(m) + '月');
			//处理空格
			var $Date = new Date();
			$Date.setMonth($Date.getMonth() + now, 1);
			var gap = $Date.getDay(); //空白数
			if (gap == 0) {
				gap = 7
			};
			for (var i = 1; i < gap; i++) {
				$('<li>&nbsp;</li>').appendTo($ul);
			};
			//处理日期
			var $Date = new Date();
			$Date.setMonth($Date.getMonth() + now + 1, 0);
			var daynum = $Date.getDate();
			for (var i = 0; i < daynum; i++) {
				$('<li><a href="javascript:;">' + (i + 1) + '</a></li>').appendTo($ul);
			};
			//处理颜色
			if (now == initNow) {
				$ul.children().each(function () {
					var $a = $(this).children();
					//颜色now
					if ($a.html() == t.d) {
						$(this).addClass('cld_now');
					};
				});
			};
			//颜色限制
			if (now == oNow) {
				if (o != null) {
					$ul.children().each(function () {
						var $a = $(this).children();
						if (who == 'f') {
							if ($a.html() - 0 > o.d) {
								$(this).addClass('cld_ps');
							};
						} else if (who == 's') {
							if ($a.html() - 0 < o.d) {
								$(this).addClass('cld_ps');
							};
						}
					});
				};
			};
			if (who == 'f' && o) {
				if (now > oNow) {
					$ul.children().each(function () {
						$(this).addClass('cld_ps');
					});
				};
			} else if (who == 's' && o) {
				if (now < oNow) {
					$ul.children().each(function () {
						$(this).addClass('cld_ps');
					});
				};
			}
		}
		/*日期改变函数*/
		function changedd(t) {
			var $oDate = new Date();
			now = (t.y - $oDate.getFullYear()) * 12 - 0 + (t.m - $oDate.getMonth() - 1);
			dd();
		};
		/*显示日期选项卡函数*/
		function ddshow() {
			yOd = 'dd';
			$cld_ct.children().attr('disabled', false).removeClass('cld_disable');
			$cld_year.hide();
			$cld_month.hide();
			$cld_wd.show();
		};
		/*添0函数*/
		function toDub(n) {
			return n < 10 ? '0' + n : '' + n;
		}
		return $cld;
	};
})(jQuery);