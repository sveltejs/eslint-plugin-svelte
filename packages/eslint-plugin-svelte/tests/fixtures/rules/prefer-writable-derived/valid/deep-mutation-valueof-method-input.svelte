<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const list = [1];
	list.valueOf().map = function (callback) {
		callback()[0].done = true;
	};
	list.map(() => items);
</script>
