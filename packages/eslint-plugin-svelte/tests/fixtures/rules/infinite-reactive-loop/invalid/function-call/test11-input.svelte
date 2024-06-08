<script>
	let a = 0;

	$: {
		a += 1;
		void (async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
			a += 1;
		})();
	}
</script>
