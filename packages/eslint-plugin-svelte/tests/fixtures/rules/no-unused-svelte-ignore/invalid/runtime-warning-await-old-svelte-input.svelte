<script>
	let { url } = $props();
	async function load() {
		// svelte-ignore await_reactivity_loss
		return await fetch(url);
	}
</script>

<button onclick={load}>load</button>
