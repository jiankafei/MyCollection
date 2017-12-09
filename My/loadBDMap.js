/*
*使用:
map({
	ak:,//地图密钥
	cb:function(fn){
		//fn是创建地图的函数，会返回一个map对象的实例
		var map=fn({
			id:,//必填项，字符串
			opts:,//map对象的默认参数，默认为{minZoom: 6, enableAutoResize: true}
			city://默认城市
		});
	}
});
*/
function map(json){
	//初始化data
	if (! json.ak) {
		console.log('缺少AK！！');
		return false;
	};
	var oS=document.createElement('script'),
		head=document.getElementsByTagName('head')[0];
	oS.src='http://api.map.baidu.com/api?v=2.0&ak='+json.ak+'&callback=mapInitFn';
	//先写全局回调函数
	window.mapInitFn=function(){
		//创建地图函数
		var createMap=function(json){
			var id = json.id,
				opts = json.opts ? json.opts : {minZoom: 6, enableAutoResize: true},
				point = new BMap.Point(116.403906,39.915175);
				//city = json.city || '北京';
			//创建地图实例
			var map=new BMap.Map(id,opts);
			map.centerAndZoom(point,10);
			map.enableInertialDragging();
			map.enableContinuousZoom();
			map.enableScrollWheelZoom(true);
			return map;
		};
		json.cb && json.cb(createMap);
	};

	//执行回掉函数
	head.appendChild(oS);
};
