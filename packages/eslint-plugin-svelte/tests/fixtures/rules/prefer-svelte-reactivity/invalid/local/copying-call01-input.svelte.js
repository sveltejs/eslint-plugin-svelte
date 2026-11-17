let leaked;

function replacer() {
	const set = new Set();
	set.add(1);
	JSON.stringify(set, (key, value) => {
		leaked = value;
		return value;
	});
}

function thisArg() {
	const set = new Set();
	set.add(1);
	Array.from(
		[1],
		function () {
			leaked = this;
		},
		set
	);
}

function notFirst(base) {
	const url = new URL(base);
	url.pathname = '/x';
	return new URL('/y', url);
}

function directEval() {
	const set = new Set();
	set.add(1);
	return eval('set');
}

replacer();
thisArg();
notFirst('https://svelte.dev');
directEval();
console.log(leaked);
