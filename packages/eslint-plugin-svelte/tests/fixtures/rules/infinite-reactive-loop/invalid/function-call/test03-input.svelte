<script>
	let a = 0;
	const fetch = async () => {
		await new Promise((resolve) => setTimeout(resolve, 100));
	};
	const doSomething = async () => {
		await fetch();
		a += 1;
	};

	$: (async () => {
		console.log(a);
		await doSomething();
	})();

	$: (async () => {
		// should not report here
		await doSomething();
	})();
</script>
