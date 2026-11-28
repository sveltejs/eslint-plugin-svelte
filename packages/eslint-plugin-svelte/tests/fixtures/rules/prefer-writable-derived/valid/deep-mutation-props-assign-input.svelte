<svelte:options customElement="x-list" />

<script>
	let { src, picked } = $props();
	let items = $state([]);
	$effect(() => {
		items = src;
	});
</script>

<button onclick={() => (picked = items)}>pick</button>
<p>{items.map((item) => item.name).join(', ')}</p>
