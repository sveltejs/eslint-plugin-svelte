<script>
	let a = 0;
	let obj = { a: 0 };
	const doSomething = async () => {
		await fetchFromServer();
		a += 1;
		obj.a += 1;
	};

	$: (async () => {
		console.log(a);
		await doSomething();
	})();
</script>
