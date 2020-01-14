let f = function(fn, delay) {
	let id = null;

	return function() {
		let args = arguments;
		let self = this;

		clearTimeout(id);

		id = setTimeout(function() {
			fn.apply(self, args);
		}, delay);
	};
};

if (window !== undefined) {
	window.debounce = f;
}

export default f;