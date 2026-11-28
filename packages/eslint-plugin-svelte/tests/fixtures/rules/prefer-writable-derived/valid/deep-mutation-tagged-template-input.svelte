<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function tag(strings, list) {
		list[0].done = true;
	}
	tag`${items}`;
</script>
