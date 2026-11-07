export function collect(items) {
	const all = new Set();
	for (const item of items) all.add(item);
	return all;
}
