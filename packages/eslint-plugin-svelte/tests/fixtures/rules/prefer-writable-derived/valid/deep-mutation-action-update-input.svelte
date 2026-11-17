<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function action(node, param) {
		return {
			update(newParam) {
				newParam[0].done = true;
			}
		};
	}
</script>

<div use:action={items}></div>
