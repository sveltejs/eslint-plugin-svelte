export function collect(items: string[]): Set<string> {
	const all = new Set<string>();
	for (const item of items) all.add(item);
	return all;
}
