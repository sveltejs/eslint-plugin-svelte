<script>
	let obj = { a: 0 };

	const doSomething = async () => {
		obj.a += 1;
		await fetch();
	};

	$: (async () => {
		obj.a += 1;
		await doSomething();
	})();
</script>
