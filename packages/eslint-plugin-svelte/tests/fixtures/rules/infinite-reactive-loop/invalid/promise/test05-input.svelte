<script>
	let a = 0;

	$: (() => {
		Promise.resolve()
			.catch(() => {
				a = a + 1;
			})
			.catch(() => {
				a = a + 1;
			});
	})();
</script>
