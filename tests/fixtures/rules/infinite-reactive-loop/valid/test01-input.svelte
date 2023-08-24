<script>
	let a = 0;

	$: (async () => {
		a = a + 1;
		a += 1;
		await new Promise((resolve) => {});
	})();

	$: (async () => {
		let a = 0;
		await new Promise((resolve) => {
			setTimeout(() => {
				a = a + 1;
				a += 1;
			}, 100);
		});
	})();
</script>
