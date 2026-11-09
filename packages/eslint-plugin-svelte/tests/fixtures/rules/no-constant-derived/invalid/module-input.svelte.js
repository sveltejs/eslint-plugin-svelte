export function createCounter() {
	let count = $derived(0);
	return {
		get count() {
			return count;
		}
	};
}
