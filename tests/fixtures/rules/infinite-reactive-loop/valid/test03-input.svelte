<script>
	let a = 0;

	$: (async () => {
		await doSomething((a += 1));
	})();
</script>
