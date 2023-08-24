<script>
	let div;
	const remove = () => (div.unknown = '');
</script>

<div bind:this={div}>div</div>

<button on:click={() => remove()}>Click Me</button>
