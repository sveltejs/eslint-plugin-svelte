<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function run() {
		var mark = () => {};
		var mark = (list) => (list[0].done = true);
		mark(items);
	}
</script>

<button onclick={run}>run</button>
