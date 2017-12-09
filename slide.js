/*
*var json={
	box:box,//滚动对象box容器,必填
	prev:pre,//上一个按钮
	next:next,//下一个按钮
	dots:dots,//导航点box容器
	havaDots:true,//有没有导航点，boolean值，默认为false
	itemNum:,//视口单位数，默认为1
	itemSpace:,//item间的间隔距离,默认为0
	itemWidth:,//每次滚动距离,没传该项会有计算的默认值
}
外部方法：
.autoRun()//自动滚动
.prevItem()//上一个
.nextItem()//下一个
.dotsTrans()//导航点切换
*注：
*1.这里的对象都是jQuery对象;
*2.当前导航点的class为on;
*/
function Slide(json) {
	this.now = 1; //索引
	this.key = 0; //状态锁,0表示没有滚动在执行，1表示有
	this.box = json.box; //滚动对象box
	this.prev = json.prev || null; //上一个按钮
	this.next = json.next || null; //下一个按钮
	this.dots = json.dots || null; //导航点box
	this.havaDots = json.havaDots || false; //是否有导航点，布尔值
	this.itemNum = parseFloat(json.itemNum) || 1; //视口单位数
	this.itemSpace = parseFloat(json.itemSpace) || 0; //元素间距
	this.itemWidth = json.box.parent().innerWidth() + (parseFloat(json.itemSpace) || 0); //每次滚动距离
	this.maxLength = Math.ceil(json.box.children().length / (parseFloat(json.itemNum) || 1)); //按单位数计算的总length
	this.init(json); //初始化
};
//判断是否为空以及item数量是否够一次的滚动
Slide.prototype.isOk = function () {
	if (!$.isEmptyObject(this.box)) {
		return (this.box.children().length > this.itemNum ? true : false);
	} else {
		return false;
	}
};

//初始化
Slide.prototype.init = function (json) {
	if (!this.isOk()) {
		if (this.prev) {
			this.prev.css('display', 'none');
			this.next.css('display', 'none');
		}
		return false;
	};
	var _this = this;
	var children = this.box.children();
	var arr = [];
	for (var i = 0; i < children.length; i++) {
		arr.push(children[i].outerHTML);
	};

	var rmd = children.length % this.itemNum; //余数
	if (rmd !== 0) {
		var arrTemp = arr.slice(0, -rmd);
	} else {
		arrTemp = arr;
	}

	//改变html和计算宽度
	this.box.html(arrTemp.slice(-this.itemNum).join('') + arrTemp.join('') + arrTemp.slice(0, this.itemNum).join(''));
	this.box.width(this.box.children().length * this.itemWidth - this.itemSpace);
	this.box.css('left', -this.itemWidth);

	//添加dots
	if (this.havaDots) {
		if (!this.dots) {
			this.dots = $('<div class="clearfix"></div>');
			this.box.parent().append(this.dots);
		}
		for (var i = 0; i < this.maxLength; i++) {
			this.dots.append($('<a href="javascript:;" class="fl"></a>'));
		};
		//默认第一个导航点为on
		this.dots.children().eq(0).addClass('on');
		this.dots.css('margin-left', -parseFloat(this.dots.outerWidth()) / 2 + 'px');
	};
};
//自动滚动
Slide.prototype.autoRun = function () {
	var _this = this;
	if (this.isOk()) {
		function atr() {
			_this.box.timer = setInterval(function () {
				_this.now++;
				var opt = {
					dot: (_this.now - 1) % _this.maxLength,
					left: -_this.itemWidth * _this.now,
					cb: function () {
						if (_this.now == _this.maxLength + 1) {
							_this.now = 1;
							_this.box.css('left', -_this.itemWidth);
						};
						_this.key = 0;
					}
				};
				_this.run(opt);
			}, 3000);
		};

		this.box.parent().parent().mouseover(function () {
			clearInterval(_this.box.timer);
		});
		this.box.parent().parent().mouseout(function () {
			atr();
		});
		//自动滚动
		atr();
	};
	return this;
};
//上一个
Slide.prototype.prevItem = function () {
	var _this = this;
	if (this.isOk()) {
		this.prev.click(function (event) {
			if (!_this.key) {
				_this.key = 1;
				_this.now--;
				var opt = {
					dot: (_this.now - 1 + _this.maxLength) % _this.maxLength,
					left: -_this.itemWidth * _this.now,
					cb: function () {
						if (_this.now == 0) {
							_this.now = _this.maxLength;
							_this.box.css('left', -_this.itemWidth * _this.now);
						};
						_this.key = 0;
					}
				};
				_this.run(opt);
			};
		});
	};
	return this;
};
//下一个
Slide.prototype.nextItem = function () {
	var _this = this;
	if (this.isOk()) {
		this.next.click(function (event) {
			if (!_this.key) {
				_this.key = 1;
				_this.now++;
				var opt = {
					dot: (_this.now - 1) % _this.maxLength,
					left: -_this.itemWidth * _this.now,
					cb: function () {
						if (_this.now == _this.maxLength + 1) {
							_this.now = 1;
							_this.box.css('left', -_this.itemWidth);
						};
						_this.key = 0;
					}
				};
				_this.run(opt);
			};
		});
	};
	return this;
};
//dots切换
Slide.prototype.dotsTrans = function () {
	var _this = this;
	if (this.havaDots) {
		this.dots.on('click', 'a', function (event) {
			var tg = event.currentTarget;
			_this.now = $(tg).index() + 1;
			_this.box.stop().animate({
				left: -_this.itemWidth * _this.now
			});
			var $ison = $(_this.dots.children('a.on'));
			if ($ison) {
				$ison.removeClass('on');
			};
			$(tg).addClass('on');
		});
	};
	return this;
};
//内部方法，运动
Slide.prototype.run = function (opt) { //运动
	if (this.havaDots) {
		var $ison = $(this.dots.children('a.on'));
		if ($ison) {
			$ison.removeClass('on');
		};
		this.dots.children('a').eq(opt.dot).addClass('on');
	}
	this.box.stop().animate({
		left: opt.left
	}, opt.cb);
};