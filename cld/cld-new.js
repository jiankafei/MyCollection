/*日历和日期插件*/
;(function(G){
	function CLD(){

	};
	G.CLD = CLD;
})(window);

/*
使用：
var cld = new CLD({
	
});
cld.xxx = '';

class:
	.cld
Temp:
	data-mindate: y:m:d:h:s:i
	data-maxdate: y:m:d:h:s:i
	data-format: 

Opts:
	format
		yy, yyyy, m, mm, d, dd, h, hh, i, ii, s, ss,
		ymdhsi之间使用的分隔符可以完全自定义
	minDate
	maxDate
	minYear
	maxYear
	minMonth
	maxMonth
	minDay
	maxDay

	defaultView
	minView
	maxView

	todyAsDefault//在没有默认值的情况下是否把今天的值当作默认值
	autoClose//是否在选择完后自动关闭选择器
	keyboardNavigation//是否开启方向键控制
	gotoCurrent//点击当天按钮时，将移至当前已选中的日期，而不是今天
	numberOfMonths//设置一次要显示多少个月份
	inline//是否行内显示
	inlineWp//行内显示盒子
	linkField//
	linkFormat//

	initEffect

Method:
	destroy
	dialog
	getDate
	isDisabled
	update
	setMinDate
	setMaxDate
	show
	hide
Event:
	show
	hide
	select
	changeDate
	changeYear
	changeMonth
keyboard:
	up, down, left, right //方向
	escape //显示隐藏
	enter //第一次是选择，第二次是提交
effectCallback:
	today:
	diy:

 */