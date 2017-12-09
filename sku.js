function Sku(data) {
	this.keyArr = []; // 保存sku键名的数组
	this.skuArr = []; // 保存每个sku值的数组
	this.pathArr = []; // 所有商品的路径数组
	this.combSet = []; // 所有组合的集合
	this.skuObjJson = {}; // 保存商品path和对应的商品sku对象
	this.spliter = '@'; // 间隔符

	this.selectedSku = []; // 选择过的sku的数组
	this.skuIsDis = []; // sku无效状态
	this.initSkuIsDis = []; // 初始的sku无效状态
	// 初始化
	this.init(data);
}
Sku.prototype = {
	constructor: Sku,
	init: function (data) {
		let keyArr = [],
			skuArr = [],
			skuObjJson = {},
			selectedSku = [],
			skuIsDis = [],
			initSkuIsDis = [],
			pathArr = [],
			combSet = [],
			spliter = this.spliter;
		// 获取 key 数组
		for (let key in data[0]) {
			data[0].hasOwnProperty(key) && key !== 'skuId' && keyArr.push(key);
		}
		// sku状态，存储选择的sku数组，sku单元数组的初始化
		keyArr.forEach(function (val, index, self) {
			skuArr[index] = [];
			skuIsDis[index] = [];
			initSkuIsDis[index] = [];
			selectedSku[index] = '';
		});
		// sku单元数组，skuId对象，路径数组，sku状态的填充
		data.forEach(function (item, key, self) {
			let p = [];
			keyArr.forEach(function (val, index, self) {
				let f = skuArr[index],
					s = item[val];
				f.indexOf(s) === -1 && (f.push(s), initSkuIsDis[index].push(false));
				p.push(s);
			});
			skuObjJson[p.join(spliter)] = item;
			pathArr.push(p);
		});
		// 合并多个数组的幂集，填充combSet
		pathArr.forEach(function (item, index, self) {
			let m = powerSet(item);
			m.forEach(function (val, key, self) {
				let cell = val.join(spliter);
				combSet.indexOf(cell) === -1 && combSet.push(cell);
			});
		});
		// 取得数组的所有子集「幂集」
		function powerSet(arr) {
			let ps = [[]], i, j, len;
			for (i = 0; i < arr.length; i++) {
				for (j = 0, len = ps.length; j < len; j++) {
					ps.push(ps[j].concat(arr[i]));
				}
			}
			return ps;
		}
		// 挂载到对象上
		this.spliter = spliter;
		this.keyArr = keyArr;
		this.skuArr = skuArr;
		this.selectedSku = selectedSku;
		this.skuObjJson = skuObjJson;
		this.initSkuIsDis = initSkuIsDis;
		this.skuIsDis = initSkuIsDis;
		this.pathArr = pathArr;
		this.combSet = combSet;
	},
	// 在点击某个sku时执行
	selectSku: function (key, sku, i, j) {
		// 点击无效sku
		if (this.skuIsDis[i][j]) {
			this.selectedSku = Array(this.keyArr.length).fill('');
			this.skuIsDis = JSON.parse(JSON.stringify(this.initSkuIsDis));
		}
		// 存储选择过的sku，可以根据该项设置sku选中状态的切换
		this.selectedSku[i] = sku;
		// 更新状态
		this.updateStatus();
		// 获取skuId
		this.getSkuObj();
	},
	// 更新sku状态
	updateStatus: function () {
		let skuArr = this.skuArr,
			spliter = this.spliter,
			combSet = this.combSet,
			selectedSku = this.selectedSku,
			skuIsDis = JSON.parse(JSON.stringify(this.skuIsDis));
		// 取得sku和选择元素组合的所有可能性
		this.keyArr.forEach(function (val, i, self) {
			let everySku = skuArr[i],
				copySel = selectedSku.slice(),
				cellIsDis = skuIsDis[i];
			everySku.forEach(function (sku, j, self) {
				if (selectedSku[i] !== sku) {
					copySel[i] = sku;
					let trimPath = copySel.filter(function (val) {
						if (val) return val;
					}).join(spliter);
					if (combSet.indexOf(trimPath) === -1) {
						// 该单元和已选sku的组合无效，无效为真
						cellIsDis[j] = true;
					} else {
						// 该单元和已选sku的组合有效，无效为假
						cellIsDis[j] = false;
					}
				}
			});
		});
		this.skuIsDis = skuIsDis;
	},
	// 选择后获取对应商品对象
	getSkuObj: function () {
		let skuObjJson = this.skuObjJson,
			spliter = this.spliter,
			selectedSku = this.selectedSku,
			tempselSku = selectedSku.filter(function (val) {
				if (val) return val;
			}),
			findedSkuObj = skuObjJson[tempselSku.join(spliter)] || undefined;

		if (tempselSku.length === selectedSku.length) {
			return findedSkuObj;
		}
	}
};

// 示例
var data = [{
		'type': '单人票',
		'date': '8月22号',
		'time': '10:30',
		'skuId': '1',
	},
	{
		'type': '双人票',
		'date': '8月22号',
		'time': '12:30',
		'skuId': '2',
	},
	{
		'type': '三人票',
		'date': '8月28号',
		'time': '2:30',
		'skuId': '3',
	},
	{
		'type': '单人票',
		'date': '8月10号',
		'time': '10:30',
		'skuId': '4',
	},
	{
		'type': '双人票',
		'date': '8月10号',
		'time': '12:30',
		'skuId': '5',
	},
	{
		'type': '单人票',
		'date': '8月28号',
		'time': '2:30',
		'skuId': '6',
	}
];
var prop = {
	type: '类型',
	date: '日期',
	time: '时间',
};
var prop2 = [{
		sku: 'type',
		name: '类型'
	},
	{
		sku: 'date',
		name: '日期'
	},
	{
		sku: 'time',
		name: '时间'
	},
];

var good = new Sku(data);
console.log(good.keyArr, good.skuArr, good.pathArr, good.combSet, good.skuObjJson);
