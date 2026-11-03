<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		if (a.b > 0) {
			return a.b;
		}
		return 0;
	});
</script>

{foo}
