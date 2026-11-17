<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	class Check {
		static [Symbol.hasInstance](value) {
			value[0].done = true;
			return true;
		}
	}
	const isCheck = $derived(items instanceof Check);
</script>

<p>{isCheck}</p>
