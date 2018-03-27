'use strict';

import { QRMode } from './QRConst';

class QR8bitByte {
	constructor(data){
		this.mode = QRMode.MODE_8BIT_BYTE;
		this.data = data;
		this.parsedData = [];
		// Added to support UTF-8 Characters
		for (let i = 0, l = this.data.length; i < l; i++) {
			const byteArray = [];
			let code = this.data.charCodeAt(i);

			if (code > 0x10000) {
				byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
				byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
				byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[3] = 0x80 | (code & 0x3F);
			} else if (code > 0x800) {
				byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
				byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
				byteArray[2] = 0x80 | (code & 0x3F);
			} else if (code > 0x80) {
				byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
				byteArray[1] = 0x80 | (code & 0x3F);
			} else {
				byteArray[0] = code;
			}

			this.parsedData.push(byteArray);
		}
		this.parsedData = Array.prototype.concat.apply([], this.parsedData);
		if (this.parsedData.length !== this.data.length) {
			this.parsedData.unshift(191);
			this.parsedData.unshift(187);
			this.parsedData.unshift(239);
		}
	}
	getLength(buffer){
		return this.parsedData.length;
	}
	write(buffer){
		const parsedData = this.parsedData;
		for (const data of parsedData) {
			buffer.put(data, 8);
		}
	}
};

export default QR8bitByte;
