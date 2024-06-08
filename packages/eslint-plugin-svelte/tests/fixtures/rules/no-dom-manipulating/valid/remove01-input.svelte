<script>
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => (show = !show);
</script>

{#if show}
	<div bind:this={div}>div</div>
{/if}

<button on:click={() => toggle()}>Click Me</button>
