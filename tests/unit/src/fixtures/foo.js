
var foo = { something: 1};

export default function () {
	var n = 0;
	Array.prototype.slice(arguments).forEach(function (v) {
		n += v;
	});
	return n;
};
