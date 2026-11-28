<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const helper = {
		then(resolve) {
			this.items[0].done = true;
			resolve(1);
		}
	};
	async function load() {
		return { ...helper, items };
	}
</script>

<button onclick={load}>load</button>
