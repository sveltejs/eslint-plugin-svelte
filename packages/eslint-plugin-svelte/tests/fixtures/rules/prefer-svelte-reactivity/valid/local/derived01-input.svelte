<script>
	let { toys, base } = $props();

	const uniqueToys = $derived.by(() => {
		const names = new Set();
		const result = [];
		for (const toy of toys) {
			if (!names.has(toy.name)) {
				names.add(toy.name);
				result.push(toy);
			}
		}
		return result;
	});

	const href = $derived.by(() => {
		const url = new URL(base);
		url.pathname = '/search';
		return url.href;
	});
</script>

<a {href}>{uniqueToys.length}</a>
