<script>
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => (show = !show);

	// ✗ BAD
	const remove = () => div.remove();
</script>

{#if show}
	<div bind:this={div}>div</div>
{/if}

<button on:click={() => toggle()}>Click Me (Good)</button>
<button on:click={() => remove()}>Click Me (Bad)</button>
