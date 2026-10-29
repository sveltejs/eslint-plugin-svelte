let toys = $state([]);

export function getUniqueToys() {
	let names = new Set();
	let uniqueToys = [];
	for (const toy in toys) {
		if (!names.has(toy.name)) {
			uniqueToys.push(toy);
		}
	}
	return uniqueToys;
}

let uniqueToys = $derived.by(getUniqueToys);

console.log(uniqueToys)