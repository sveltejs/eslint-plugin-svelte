<script>
	let a = $state({ b: 1 });
	const foo = $derived((a.b, 1));
	const bar = $derived((a.b, 2));
</script>

{foo}{bar}
