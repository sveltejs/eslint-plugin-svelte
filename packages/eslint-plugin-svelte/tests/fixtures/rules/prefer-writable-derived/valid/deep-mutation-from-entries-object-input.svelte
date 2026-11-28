<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const text = $derived(
		String(
			Object.fromEntries([
				[
					'toString',
					function () {
						this.items[0].done = true;
						return '';
					}
				],
				['items', items]
			])
		)
	);
</script>

<p>{text}</p>
