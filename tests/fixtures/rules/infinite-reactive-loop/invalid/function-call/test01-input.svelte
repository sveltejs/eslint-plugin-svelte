<script>
	const fetch = () => new Promise((resolve) => setTimeout(resolve, 100));
	let a = 0;

	$: fetch().then(() => {
		a = a + 1;
	});
</script>
