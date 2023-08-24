<script>
	let a = 0;

	const func = () => {
		return {
			then: (fun) => fun(),
			catch: (fun) => fun()
		};
	};

	$: (() => {
		// TODO: This is a false positive. we need to check if the `then` or `catch` is `Promise` object's function.
		// func().then(() => (a += 1))
		// func().catch(() => (a += 1))
	})();
</script>
