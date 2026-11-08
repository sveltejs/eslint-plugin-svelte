<script>
	const { data } = $props();
	let value = $state(data.value);
	$effect(() => {
		value = {
			items: data.items,
			get first() {
				this.items[0].done = true;
				return 1;
			}
		};
	});
</script>

<p>{value.first}</p>
