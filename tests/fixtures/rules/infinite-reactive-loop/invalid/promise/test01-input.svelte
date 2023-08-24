<script>
	let a = 0;

	$: (() => {
		Promise.resolve().then(() => {
			a = a + 1;
			a += 1;
		});

		Promise.resolve().catch(() => {
			a = a + 1;
		});
	})();
</script>
