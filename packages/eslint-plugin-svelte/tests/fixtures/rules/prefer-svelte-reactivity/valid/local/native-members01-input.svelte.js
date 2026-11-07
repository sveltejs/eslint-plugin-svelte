function urlProperties() {
	const url = new URL('https://example.com');
	url.pathname = '/foo';
	url['search'] = '?a=1';
	url.hash = '#section';
	url.searchParams.set('b', '2');
	url.searchParams.sort();
	return JSON.stringify(url);
}

function dateMethods() {
	const date = new Date();
	date.setUTCFullYear(2020);
	date.setHours(0);
	return date.toISOString() + date.getTime();
}

function collections() {
	const map = new Map();
	map.set('a', 1);
	const set = new Set();
	set.add(map.get('a'));
	set.delete(0);
	map.clear();
	return set.has(1) && map.size === 0;
}
