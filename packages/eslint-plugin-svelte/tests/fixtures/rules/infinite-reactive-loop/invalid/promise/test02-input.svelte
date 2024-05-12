<script>
	let a = 0;

	$: {
		a = a + 1;
		new Promise((resolve, reject) => {
			/** do something */
		})
			.then(() => {
				a = a + 1;
			})
			.catch(() => {
				a = a + 1;
			});
		a = a + 1;
	}
</script>
