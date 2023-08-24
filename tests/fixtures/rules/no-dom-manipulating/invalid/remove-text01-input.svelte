<script>
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => (show = !show);

	// ✗ BAD
	const update = () => (div.textContent = 'foo');
</script>

<div bind:this={div}>
	{#if show}
		div
	{/if}
</div>

<button on:click={() => toggle()}>Click Me (Good)</button>
<button on:click={() => update()}>Click Me (Bad)</button>
