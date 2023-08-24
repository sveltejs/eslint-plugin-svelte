<script>
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => (show = !show);
</script>

<div bind:this={div}>
	{#if show}
		div
	{/if}
</div>

<button on:click={() => toggle()}>Click Me</button>
