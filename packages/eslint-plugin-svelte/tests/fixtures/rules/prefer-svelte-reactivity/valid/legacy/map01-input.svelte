<script>
	const cache = new Map();
	$: size = cache.size;

	cache.set('a', 1);
</script>

{size}
