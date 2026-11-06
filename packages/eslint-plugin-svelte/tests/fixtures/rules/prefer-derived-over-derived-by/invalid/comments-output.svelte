<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		// `b` is never negative here.
		return a.b;
	});
	const bar = $derived.by(/* outer */ () => a.b);
	const baz = $derived(a.b /* kept */ + 1);
</script>

{foo}{bar}{baz}
