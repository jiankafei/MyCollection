'use strict';

const STATUS_CODES = require('http').STATUS_CODES;

const {
	msgMap: STATUS_MSGS,
	codes: CODES
} = dealCodeMap(STATUS_CODES);

const status = module.exports = {
	// status codes for redirects
	redirect: {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	},
	// status codes for empty bodies
	empty: {
		204: true,
		205: true,
		304: true
	},
	// status codes for when you should retry the request
	retry: {
		502: true,
		503: true,
		504: true
	},
	// {code: msg} 对象
	STATUS_CODES,
	// {msg: code} 对象
	STATUS_MSGS,
	// code 数组
	CODES,
	// 通过 msg 获取 code
	getCode(msg) {
		if (!STATUS_MEGS(msg)) {
			throw new Error(`invalid status message: ${msg}`);
			return false;
		}
		return STATUS_MEGS(msg);
	},
	// 通过 msg 获得 code
	getMsg(code) {
		if (!STATUS_CODES[code]) {
			throw new Error(`invalid status code: ${code}`);
			return false;
		}
		return STATUS_CODES[code];
	}
};

// 生成 STATUS_MEGS 对象
// 生成 CODES 数组
function dealCodeMap(codeMap) {
	const msgMap = {};
	const codes = [];
	Object.keys(codeMap).forEach(function (msg, code, self) {
		msgMap[msg] = code;
		codes.push(code);
	}, this);
	return {
		msgMap,
		codes
	};
}