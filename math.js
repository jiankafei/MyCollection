const math = {
	// 加法
	add(m, n) {
		let mArr = (m + '').split('.'),
			nArr = (n + '').split('.'),
			ml = mArr[1] ? mArr[1].length : 0,
			nl = nArr[1] ? nArr[1].length : 0,
			l = ml >= nl ? ml : nl;
		return ((m * Math.pow(10, l)) + (n * Math.pow(10, l))) / Math.pow(10, l);
	},
	// 减法
	sub(m, n) {
		let mArr = (m + '').split('.'),
			nArr = (n + '').split('.'),
			ml = mArr[1] ? mArr[1].length : 0,
			nl = nArr[1] ? nArr[1].length : 0,
			l = ml >= nl ? ml : nl;
		return ((m * Math.pow(10, l)) - (n * Math.pow(10, l))) / Math.pow(10, l);
	},
	// 乘法
	mul(m, n) {
		let mArr = (m + '').split('.'),
			nArr = (n + '').split('.'),
			ml = mArr[1] ? mArr[1].length : 0,
			nl = nArr[1] ? nArr[1].length : 0;
		return (m * Math.pow(10, ml)) * (n * Math.pow(10, nl)) / Math.pow(10, (ml + nl));
	},
	// 除法
	div(m, n, place) {
		// 除法不做处理
	},
};
