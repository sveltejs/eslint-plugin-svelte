<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const helpers = {
		then(resolve) {
			this.items[0].done = true;
			resolve(1);
		}
	};
	async function run() {
		await { ...helpers, items };
	}
</script>

<button onclick={run}>run</button>
