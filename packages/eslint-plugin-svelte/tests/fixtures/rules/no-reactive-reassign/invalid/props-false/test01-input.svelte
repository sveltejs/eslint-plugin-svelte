<script>
	let value = 0;
	$: reactiveValue = value * 2;

	function handleClick() {
		/* ✗ BAD */
		reactiveValue++;
	}
</script>

<button on:click={handleClick}>Click Me</button>
<!-- ✓ GOOD -->
<input type="number" bind:value />
<!-- ✗ BAD -->
<input type="number" bind:value={reactiveValue} />

{reactiveValue}
