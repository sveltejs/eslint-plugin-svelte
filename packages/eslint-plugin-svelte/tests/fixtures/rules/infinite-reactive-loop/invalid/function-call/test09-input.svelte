<script>
	let obj = { a: 0 };

	const doSomething = async () => {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return 1;
	};

	$: (async () => {
		obj.a += await doSomething((obj.a += 1));
	})();
</script>
