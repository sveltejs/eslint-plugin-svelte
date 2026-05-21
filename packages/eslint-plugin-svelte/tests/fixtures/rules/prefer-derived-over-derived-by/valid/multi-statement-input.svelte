<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		const c = a.b * 2;
		return c + 1;
	});
</script>

{foo}
