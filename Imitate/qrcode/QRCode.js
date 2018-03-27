'use strict';
/**
 * 容错率
 * L (Low)	~7%
 * M (Medium)	~15%
 * Q (Quartile)	~25%
 * H (High)	~30%
 */
/**
const qr = new QrCode({
	size: 256, // 二维码大小，默认256，size是期望宽度，真实宽度以实例属性width为准
	typeNumber: -1, // 二维码的计算模式，[1, 40] 默认-1为自动检测
	correctLevel: 'H', // 二维码纠错级别 [L, M, Q, H] 默认H
	colorDark: '#000000', // 前景颜色，默认黑色
	colorLight: '#ffffff', // 背景颜色，默认白色
	borderWidth: 0, // 边框宽度，int
	borderColor: '#ffffff', // 边框颜色
	text: '', // 文本信息，必填
	ctx: , // context对象，必填
});
属性：
	qr.realSize // 二维码真实大小
	qr.totalSize // 二维码总体大小，包括边框
	qr.ctx // canvas的 context 对象
	qr.typeNumber // 类型值
方法：
	qr.getCount(text, typeNumber = -1, correctLevel = 'H');
	qr.isDark(row, col); // 在外部循环count时使用来判断颜色深浅
	qr.renderToCanvas(x = 0, y = 0); // 绘制到canvas，默认[0, 0]，包括边框
	qr.clear(startX, startY, width, height) // 清除某区域绘制

注意：
	1. 当初始化实例时，不传options，则可以通过getCount()获取数量以及使用isDark()来判断颜色深浅，从而自定义绘制；
	2. 自定义绘制下，renderToCanvas() 无法使用；
	3. 可以使用 clear() 方法清除区域绘制；
	3. 一般情况下，直接初始化实例时传入参数，使用 renderToCanvas() 调用即可，clear在内部已经调用；
 */
import QRCodeModel from './QRCodeModel';
import QRConst from './QRConst';
const QRErrorCorrectLevel = QRConst.QRErrorCorrectLevel;
const QRCodeLimitLength = QRConst.QRCodeLimitLength;

const getUTF8Length = function (text) {
	let replacedText = encodeURI(text).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	return replacedText.length + (replacedText.length !== text.length ? 3 : 0);
};

const getTypeNumber = function (text, correctLevel) {
	let type = 1;
	let length = getUTF8Length(text);

	for (let i = 0, l = QRCodeLimitLength.length; i <= l; i++) {
		let limit = 0;
		const limitLength = QRCodeLimitLength[i];
		switch (correctLevel) {
			case QRErrorCorrectLevel.L:
				limit = limitLength[0];
				break;
			case QRErrorCorrectLevel.M:
				limit = limitLength[1];
				break;
			case QRErrorCorrectLevel.Q:
				limit = limitLength[2];
				break;
			case QRErrorCorrectLevel.H:
				limit = limitLength[3];
				break;
		}

		if (length <= limit) {
			break;
		} else {
			type++;
		}
	}
	if (type > QRCodeLimitLength.length) {
		throw new Error('Too long data');
	}
	// console.log(`typeNumber: ${type}`);
	return type;
};

class QRCode {
	constructor(options) {
		this.diy = false;
		if (!options) {
			this.diy = true;
			return;
		}; // 用于自定义绘制
		if (!options.ctx) {
			console.warn('please set ctx option!');
			return;
		}
		if (!options.text) {
			console.warn('please set text option!');
			return;
		}

		const opts = Object.assign(this, {
			size: 256,
			typeNumber: -1,
			colorDark: '#000000',
			colorLight: '#ffffff',
			correctLevel: 'H',
			borderWidth: 0,
			borderColor: '#ffffff',
		}, options);

		this.borderWidth = ~~this.borderWidth;

		this.count = this.getCount(this.text, this.typeNumber, this.correctLevel);
		this.tile = Math.round(this.size / this.count);
		this.realSize = this.count * this.tile;
		// console.log(this.size, this.realSize);
	}
	// 返回 count
	getCount(text, typeNumber = -1, correctLevel = 'H'){
		this.correctLevel = correctLevel;
		this.typeNumber = typeNumber === -1 ? getTypeNumber(text, QRErrorCorrectLevel[correctLevel]) : typeNumber;
		this._QRCodeModel = new QRCodeModel(this.typeNumber, QRErrorCorrectLevel[correctLevel]);
		this._QRCodeModel.addData(text);
		this._QRCodeModel.make();
		const count = this._QRCodeModel.getModuleCount();
		return count;
	}
	isDark(row, col){
		return this._QRCodeModel.isDark(row, col);
	}
	// 绘制
	renderToCanvas(x = 0, y = 0){
		if (this.diy) return; // 如果是自定义绘制则直接返回
		const {colorDark, colorLight, count, tile, realSize, borderWidth, borderColor, ctx} = this;
		const totalSize = this.totalSize =  borderWidth * 2 + realSize;

		// 先清后画
		this.clear(x, y, totalSize, totalSize);

		// 绘制边框
		ctx.setFillStyle(borderColor);
		ctx.fillRect(x, y, totalSize, borderWidth);
		ctx.fillRect(x + realSize + borderWidth, y, borderWidth, totalSize);
		ctx.fillRect(x, y + realSize + borderWidth, totalSize, borderWidth);
		ctx.fillRect(x, y, borderWidth, totalSize);

		// 绘制二维码
		for (let row = 0; row < count; row++) {
			for (let col = 0; col < count; col++) {
				const isDark = this.isDark(row, col);
				const tileX = x + borderWidth + col * tile;
        		const tileY = y + borderWidth + row * tile;
				ctx.fillStyle = isDark ? colorDark : colorLight;
				ctx.fillRect(tileX, tileY, tile, tile);
			}
		}
	}
	// 清除
	clear(startX, startY, width, height) {
		this.ctx.clearRect(startX, startY, width, height);
	}
};

export default QRCode;