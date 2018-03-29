'use strict';
/**
 * 容错率correctLevel:
 * L (Low)	~7%
 * M (Medium)	~15%
 * Q (Quartile)	~25%
 * H (High)	~30%
 *
 * 矩阵规格typeNumber:
 * 最低1的矩阵个数为21，typeNumber每加一，矩阵就增加4格，type最大40，因此矩阵个数最大177
 * count = (n-1) * 4 + 21 // 计算矩阵个数
 *
 * 前景背景色：
 * QR码扫描仪是通过红色光的照明捕捉QR码的，因此如果是背景反射红色、打印的颜色为吸收红色的组合，就可以读取
 */
/**
const qr = new QR({
	size: 256, // 二维码大小，默认256，size是期望宽度，真实宽度以实例属性width为准
	typeNumber: -1, // 二维码的计算模式，[1, 40] 默认-1为自动检测
	correctLevel: 'H', // 二维码纠错级别 [L, M, Q, H] 默认H
	colorDark: '#000000', // 前景颜色，默认黑色
	colorLight: '#ffffff', // 背景颜色，默认白色
	borderWidth: 0, // 边框宽度，int
	borderColor: '#ffffff', // 边框颜色
	dealTile: 'original', // 如何处理二维码栅格的大小[floor, round, ceil, original] 默认original
	logo: '', // logo图像
	logoSize: compute, // logo 大小，如果logo大小超过内部计算的容错，则使用内部的容错大小，默认内部计算，无法识别则自行修改
	logoRadius: '50%', // logo圆角大小，数字或百分比，最大数字为logoSize的一半，，百分比最大50%，超过自动取半，默认50%
	text: '', // 文本信息，必填
	ctx: , // context对象，必填
});
属性：
	qr.realSize // 二维码真实大小
	qr.totalSize // 二维码总体大小，包括边框
	qr.ctx // canvas的 context 对象
	qr.typeNumber // 类型值
	qr.correctLevel // 容错率
	qr.count // 矩阵数

方法：
	qr.getCount(text, typeNumber = -1, correctLevel = 'H');
	qr.isDark(row, col); // 在外部循环count时使用来判断颜色深浅
	qr.renderToCanvas(x = 0, y = 0); // 绘制到canvas，默认[0, 0]，包括边框
	qr.clear(startX, startY, width, height) // 清除某区域绘制

注意：
	1. 当初始化实例时，不传options，则可以通过getCount()获取数量以及使用isDark()来判断颜色深浅，从而自定义绘制；
	2. 自定义绘制下 renderToCanvas() 无法使用；
	3. 可以使用 clear() 方法清除区域绘制；
	3. 一般情况下，直接初始化实例时传入参数，使用 renderToCanvas() 调用即可，clear在内部已经调用；
	4. 二维码的尺寸最好是count的整数倍，开发时，遇到尺寸变化较大时，查看count属性并计算出接近预期宽度的真实宽度，建议使用该宽度
 */

import {QRCode as QRCodeModel, QRErrorCorrectLevel} from './qrcode';

const utf16to8 = str => {
    let out = '', l = str.length, c, i;
    for(i = 0; i < l; i++) {
		c = str.charCodeAt(i);
		if (c >= 0x0001 && c <= 0x007F) {
			out += str.charAt(i);
		} else if (c > 0x07FF) {
			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
			out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
			out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
		} else {
			out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
			out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
		}
    }
    return out;
};

class QR {
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
			logoRadius: '50%',
			dealTile: 'original',
		}, options);

		this.borderWidth = ~~this.borderWidth;

		this.count = this.getCount(this.text, this.typeNumber, this.correctLevel);
		this.tile = this.size / this.count;
		switch (this.dealTile) {
			case 'floor':
			this.tile = Math.floor(this.tile);
			break;
			case 'round':
			this.tile = Math.round(this.tile);
			break;
			case 'ceil':
			this.tile = Math.ceil(this.tile);
			break;
		}
		this.realSize = this.count * this.tile;
	};
	// 返回 count
	getCount(text, typeNumber = -1, correctLevel = 'H'){
		correctLevel = QRErrorCorrectLevel[correctLevel];
		const _QRCodeModel = this._QRCodeModel = new QRCodeModel(typeNumber, correctLevel);
		_QRCodeModel.addData(utf16to8(text));
		_QRCodeModel.make();
		return _QRCodeModel.getModuleCount();
	};
	// 判断是否是dark色块
	isDark(row, col){
		return this._QRCodeModel.isDark(row, col);
	};
	// 绘制
	renderToCanvas(x = 0, y = 0){
		if (this.diy) return; // 如果是自定义绘制则直接返回
		const {colorDark, colorLight, count, tile, realSize, borderWidth, borderColor, correctLevel, ctx} = this;
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
				let tileX = x + borderWidth + col * tile;
				let tileY = y + borderWidth + row * tile;
				let tileW = tile;
				let tileH = tile;
				ctx.setFillStyle(isDark ? colorDark : colorLight);
				ctx.fillRect(tileX, tileY, tileW, tileH);
			}
		}
		// 绘制logo
		if (!!this.logo) {
			let percentage = 0;
			switch (correctLevel) {
				case 'L':
				percentage = .07;
				break;
				case 'M':
				percentage = .15;
				break;
				case 'Q':
				percentage = .25;
				break;
				case 'H':
				percentage = .3;
				break;
			}
			let tempLogoSize = ~~Math.sqrt(realSize * realSize * percentage * .6);
			if (!this.logoSize || (this.logoSize && this.logoSize > tempLogoSize)) {
				this.logoSize = tempLogoSize;
			}
			const offset = (this.totalSize - this.logoSize) / 2;
			this.fillRoundRectWithImage(x + offset, y + offset, this.logoSize, this.logoSize, this.logoRadius, this.logo);
		}
	};
	// 图片填充圆角矩形
	fillRoundRectWithImage(x, y, w, h, r, logo){
		const { ctx } = this;
		ctx.save()
		this.drawRoundRect(x, y, w, h, r);
		ctx.clip()
		ctx.drawImage(logo, x, y, w, h)
		ctx.restore()
	};
	// 圆角矩形路径
	drawRoundRect(x, y, w, h, r = 0) {
		const { ctx } = this;
		const trans = (r, size) => (/%$/.test(r + '') ? size * parseFloat(r) * .01 : r);
		const wr = trans(r, w);
		const hr = trans(r, h);
		r = w < 2 * wr ? w * .5 : h < 2 * hr ? h * .5 : w < h ? wr : hr;
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	};
	// 清除
	clear(startX, startY, width, height) {
		this.ctx.clearRect(startX, startY, width, height);
	};
};

export default QR;
