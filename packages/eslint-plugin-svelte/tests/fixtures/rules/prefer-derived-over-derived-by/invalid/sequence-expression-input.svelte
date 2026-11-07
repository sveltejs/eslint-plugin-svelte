<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => (a.b, 1));
	const bar = $derived.by(() => {
		return a.b, 2;
	});
	const baz = $derived.by(() => {
		return (a.b, 3);
	});
	const qux = $derived.by(() => {
		return /* kept */ a.b, 4;
	});
</script>

{foo}{bar}{baz}{qux}
