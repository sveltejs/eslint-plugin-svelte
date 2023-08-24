<script>
	let a = 0;

	$: (async () => {
		a = a + 1;
		await doSomething();
		a = a + 1;
	})();
</script>
