<script>
	let value = 0;
	$: reactiveValue = value * 2;

	function handleClick() {
		/* ✓ GOOD */
		value++;
	}
</script>

<button on:click={handleClick}>Click Me</button>
<input type="number" bind:value />

{reactiveValue}
