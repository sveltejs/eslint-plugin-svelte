<script>
	let list = [0];

	$: (async () => {
		await doSomething();
		list.push(list.length);
	})();
</script>
