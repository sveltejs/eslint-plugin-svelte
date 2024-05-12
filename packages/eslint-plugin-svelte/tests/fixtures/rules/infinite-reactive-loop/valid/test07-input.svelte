<script>
	let obj = { a: 0 };

	const doSomething = async () => {
		obj.a += 1;
		await fetch();
	};

	$: (async () => {
		const doSomething = async () => {
			await fetch();
		};
		obj.a += 1;
		await doSomething();
	})();
</script>
