<script>
	let { url } = $props();

	// svelte-ignore await_waterfall
	const a = $derived(await fetch(url));

	async function load() {
		// svelte-ignore await_reactivity_loss
		return await fetch(url);
	}
</script>

<button onclick={load}>{a}</button>
