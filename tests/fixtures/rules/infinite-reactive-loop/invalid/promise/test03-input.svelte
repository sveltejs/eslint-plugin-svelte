<script>
	let a = 0;

	$: (() => {
		a = a + 1;
		Promise.all([])
			.then(() => {
				a = a + 1;
			})
			.catch(() => {
				a = a + 1;
			});
		a = a + 1;
	})();
</script>
