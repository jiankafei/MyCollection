/**
 json={
	obj:obj,//内容盒子对象,原生
	tips:obj,//提示盒子对象,原生
	scrollObj:obj,//滚动元素对象，原生
	ajaxOpts:{//ajax参数
		url:'path',
		type:'get' || 'post',
		data:{}
	},
	status:function(data){},//在这里返回状态,true || false || 'null' ||
	dataList:function(data){},//在这里返回数据列表
	itemContent:function(itemData){},//在这里返回内容item
	lzimgOpts:{
		offset:,//偏移量
		throttle://延迟时间
	}
 }
 注意：在有延迟加载图片的img上添加 data-lzimg="/path"
 */
;(function (g) {
	'use strict';
	var g = g,
		d = g.document;

	function LZ(json) {
		if (!json.obj || !json.ajaxOpts.url) return;
		this.isLoading = false; //是否在加载
		this.isEnd = false; //是否没有内容了
		this.offset = json.offset || 200; //触发偏移量
		this.obj = json.obj;
		this.tips = json.tips || null;
		json.ajaxOpts.data = json.ajaxOpts.data ? json.ajaxOpts.data : {};
		json.ajaxOpts.data.p = 1;
		this.ajaxOpts = json.ajaxOpts;
		this.status = json.status || null;
		this.dataList = json.dataList || null;
		this.itemContent = json.itemContent || null;
		this.dealDate = json.dealDate || null;
		this.frag = d.createDocumentFragment();
		this.lzimgOpts = json.lzimgOpts || null; //延迟加载图片参数
		this.lzimg = {} //选择的图片集合
		this.st = document.documentElement.scrollTop || document.body.scrollTop; //滚动距离
		this.allowRoll = true; //是否允许滚动
		this.scrollObj = json.scrollObj || g;
		this.init();
	};
	LZ.prototype.init = function () {
		var _this = this;
		this.fetchData();
		this.scrollObj.addEventListener('scroll', function () {
			_this.fetchData();
		});
	};
	LZ.prototype.fetchData = function () {
		var _this = this;
		var dis = this.obj.getBoundingClientRect().bottom - window.innerHeight;
		if (!this.isLoading && !this.isEnd && dis < this.offset) {
			_this.tips.style.display = 'block';
			_this.tips.innerHTML = '正在努力加载';
			this.isLoading = true;
			this.ajaxOpts.success = function (data) {
				_this.isLoading = false;
				if (_this.status) {
					var state = _this.status(data);
					if (state === 'null') {
						_this.tips.innerHTML = '暂无内容';
						return false;
						//_this.tips.style.display='none';
					}
					if (!state) {
						_this.tips.innerHTML = '主人再试试';
						return false;
					}
				}
				/*if (_this.status && !_this.status(data)) {
					_this.tips.innerHTML='主人再试试';
					return false;
				}*/
				var dataList = _this.dataList(data);
				if (dataList) {
					if (dataList.length === 0) {
						_this.isEnd = true;
						_this.tips.innerHTML = '底儿朝天了';
						return false;
					}
					for (var i = 0, l = dataList.length; i < l; i++) {
						_this.frag.appendChild(_this.createMsg(dataList[i]));
					};
				}
				_this.obj.appendChild(_this.frag);
				_this.tips.style.display = 'none';
				_this.lzimg = document.querySelectorAll('[data-lzimg]');
				if (_this.lzimgOpts) {
					_this.lzLoadImg();
				}
				_this.addP();
			};
			this.ajaxOpts.error = function () {
				_this.isLoading = false;
				if (_this.tips) {
					_this.tips.innerHTML = '网络开小差了！';
				};
			};
			ajax(this.ajaxOpts);

		}
	};
	//页数增加
	LZ.prototype.addP = function () {
		this.ajaxOpts.data.p += 1;
	};
	//创建内容
	LZ.prototype.createMsg = function (item) {
		return strToDom(this.itemContent(item));
	};
	//图片延迟加载
	LZ.prototype.lzLoadImg = function () {
		var _this = this;
		var imgArr = [],
			offset = this.lzimgOpts.offset || 0, //偏移
			throttle = this.lzimgOpts.throttle || 0, //延迟时间
			timer; //定时器
		for (var i = 0, l = this.lzimg.length; i < l; i++) {
			imgArr.push(this.lzimg[i]);
		}
		loadImg();
		window.addEventListener('scroll', function (ev) {
			if (!downward()) {
				return false;
			}
			loadImg();
		});

		function loadImg() {
			clearTimeout(timer);
			timer = setTimeout(function () {
				for (var i = imgArr.length - 1; i >= 0; i--) {
					var img = imgArr[i];
					if (inView(img)) {
						img.src = img.getAttribute('data-lzimg') || '';
						img.removeAttribute('data-lzimg');
						imgArr.splice(i, 1);
					}
				}
			}, throttle);
		};

		function downward(obj) {
			var st = document.documentElement.scrollTop || document.body.scrollTop;
			if (_this.st - st > 0) {
				_this.st = st;
				return false;
			}
			_this.st = st;
			return true;
		};

		function inView(obj) {
			var coords = obj.getBoundingClientRect();
			return ((coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset));
		};
	};
	//接口
	g.LZ = LZ;
})(window);
