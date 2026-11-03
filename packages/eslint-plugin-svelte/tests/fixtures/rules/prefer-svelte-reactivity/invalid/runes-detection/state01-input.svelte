<script>
	let count = $state(0);
	const cache = new Map();
	cache.set('count', count);
</script>

{cache.size}
