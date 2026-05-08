<script>
	let count = 0;

	function increment() {

		count++;

	}
</script>

<button on:click={increment}>{count}</button>
