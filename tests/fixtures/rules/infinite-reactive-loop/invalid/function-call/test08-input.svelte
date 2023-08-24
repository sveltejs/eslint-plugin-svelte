<script>
	let foo = { obj: 1 };

	const doSomething = async () => {
		await fetchFromServer();
		foo.obj += 1;
	};

	$: (async () => {
		const obj = { a: 0 };
		console.log(obj);
		await doSomething();
		foo.obj += 1;
		obj.a = 1;
	})();
</script>
