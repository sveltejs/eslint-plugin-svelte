<script>
	let value = 0;
	$: reactiveValue = value * 2;
</script>

<input type="number" bind:value={reactiveValue} />
