<script>
	let a = 0;

	$: (async () => {
		a = a + 1;
		await Promise.resolve();
		a = a + 1;
	})();
</script>
