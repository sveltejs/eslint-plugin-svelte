let toys = $state([]);

export function getUniqueToys() {
	const names = new Set();
	const uniqueToys = [];
	for (const toy of toys) {
		if (!names.has(toy.name)) {
			names.add(toy.name);
			uniqueToys.push(toy);
		}
	}
	return uniqueToys;
}
