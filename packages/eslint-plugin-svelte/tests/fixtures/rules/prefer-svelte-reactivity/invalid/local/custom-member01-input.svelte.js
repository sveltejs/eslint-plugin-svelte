let leaked;
function capture() {
	leaked = this;
}

function customMethod() {
	const set = new Set();
	set.add(1);
	set.expose = capture;
	set.expose();
}

function serializationHook() {
	const url = new URL('https://example.com');
	url.pathname = '/foo';
	url.toJSON = capture;
	JSON.stringify(url);
}

function coercionHook() {
	const set = new Set();
	set.add(1);
	set.toString = capture;
	String(set);
}

function symbolHook() {
	const set = new Set();
	set.add(1);
	set[Symbol.toPrimitive] = capture;
	String(set);
}

function replacedKnownMethod() {
	const map = new Map();
	map.set('a', 1);
	map.get = capture;
	map.get('a');
}

function computedWrite(name) {
	const set = new Set();
	set.add(1);
	set[name] = capture;
	String(set);
}

function unknownMethod() {
	const set = new Set();
	set.add(1);
	set.expose();
}

function unrelatedProperty() {
	const set = new Set();
	set.add(1);
	set.pathname = capture;
	set.pathname();
}

function linkedProperty() {
	const url = new URL('https://example.com');
	url.pathname = '/foo';
	url.searchParams.toString = capture;
	String(url.searchParams);
}

function methodFromOtherClass() {
	const url = new URL('https://example.com');
	url.pathname = '/foo';
	url.add(1);
}
