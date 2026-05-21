<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		return a.b;
	});
</script>

{foo}
