<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => (a.b, 1));
	const bar = $derived.by(() => {
		return a.b, 2;
	});
</script>

{foo}{bar}
