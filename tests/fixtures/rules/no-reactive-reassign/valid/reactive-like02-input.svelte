<script>
	let value = 0;
	let reactiveLikeValue;
	$: {
		reactiveLikeValue = value * 2;
	}

	function handleClick() {
		reactiveLikeValue++;
	}
</script>

<button on:click={handleClick}>Click Me</button>
<input type="number" bind:value />

{reactiveLikeValue}
