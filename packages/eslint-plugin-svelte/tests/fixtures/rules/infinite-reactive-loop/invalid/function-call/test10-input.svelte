<script>
	let obj = { a: 0 };

	const doSomething = (a, b) => {
		console.log({ a, b });
	};

	$: (async () => {
		doSomething((await 'a', (obj.a += 1)));
	})();
</script>
