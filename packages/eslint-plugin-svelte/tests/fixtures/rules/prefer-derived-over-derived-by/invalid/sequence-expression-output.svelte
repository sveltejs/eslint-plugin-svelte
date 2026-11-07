<script>
	let a = $state({ b: 1 });
	const foo = $derived((a.b, 1));
	const bar = $derived((a.b, 2));
	const baz = $derived((a.b, 3));
	const qux = $derived((/* kept */ a.b, 4));
</script>

{foo}{bar}{baz}{qux}
