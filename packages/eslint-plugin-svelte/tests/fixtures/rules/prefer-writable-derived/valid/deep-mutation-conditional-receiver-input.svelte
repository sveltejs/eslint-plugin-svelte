<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	let saved;
	const fallback = {
		map(callback) {
			saved = callback();
		}
	};
	(data.flag ? items : fallback).map(() => items);
	saved[0].done = true;
</script>
