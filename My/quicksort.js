function quicksort(arr){
	if(arr.length === 0) return arr;
	let pivotIndex = ~~(arr.length / 2),
		pivot = arr.splice(pivotIndex, 1)[0],
		left = [],
		right = [];
	for (let item of arr) {
		item < pivot ? left.push(item) : right.push(item);
	}
	return quicksort(left).concat(pivot, quicksort(right));
};
