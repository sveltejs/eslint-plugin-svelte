<script>
	let a = 0;

	$: (() => {
		Promise.resolve()
			.catch(() => {
				a = a + 1;
			})
			.then(() => {
				a = a + 1;
			});
	})();
</script>
