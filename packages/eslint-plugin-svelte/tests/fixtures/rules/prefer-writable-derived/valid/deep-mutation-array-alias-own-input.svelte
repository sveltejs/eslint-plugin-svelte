<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const list = [];
	const alias = list;
	let saved;
	alias.map = function (callback) {
		saved = callback();
	};
	list.map(() => items);
	saved[0].done = true;
</script>
