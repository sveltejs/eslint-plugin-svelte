<script>
	const seen = new Set();
	let count = 0;

	function visit(id) {
		if (seen.has(id)) return;
		seen.add(id);
		count += 1;
	}
</script>

<button on:click={() => visit('a')}>{count}</button>
