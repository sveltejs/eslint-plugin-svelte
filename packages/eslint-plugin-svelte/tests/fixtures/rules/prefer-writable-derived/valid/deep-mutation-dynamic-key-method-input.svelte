<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const list = [0];
	list[String(data.key)] = (callback) => callback();
	list.forEach(() => items)[0].done = true;
</script>
