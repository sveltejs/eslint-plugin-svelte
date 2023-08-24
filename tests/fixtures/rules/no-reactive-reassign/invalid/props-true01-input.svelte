<script>
	let value = 0;
	$: reactiveValue = { value: value * 2 };

	function handleClick() {
		/* ✓ GOOD */
		value++;
		/* ✗ BAD */
		reactiveValue.value++;
	}
</script>

<!-- ✓ GOOD -->
<input type="number" bind:value />
<!-- ✗ BAD -->
<input type="number" bind:value={reactiveValue.value} />
