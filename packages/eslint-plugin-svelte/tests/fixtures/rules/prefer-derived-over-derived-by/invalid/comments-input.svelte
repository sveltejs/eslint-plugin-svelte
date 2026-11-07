<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		// `b` is never negative here.
		return a.b;
	});
	const bar = $derived.by(/* outer */ () => a.b);
	const baz = $derived.by(() => a.b /* kept */ + 1);
	const qux = $derived.by(() => /** @type {number} */ (a.b));
	const quux = $derived.by(() => {
		return /* kept */ a.b;
	});
	const corge = $derived.by(() => a.b /* kept */);
	const grault = $derived.by(() => {
		return a.b; // lost
	});
	const garply = $derived.by((/* lost */) => a.b);
</script>

{foo}{bar}{baz}{qux}{quux}{corge}{grault}{garply}
