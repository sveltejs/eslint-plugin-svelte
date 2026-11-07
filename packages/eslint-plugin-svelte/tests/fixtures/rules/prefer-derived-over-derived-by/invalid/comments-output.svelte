<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => {
		// `b` is never negative here.
		return a.b;
	});
	const bar = $derived(/* outer */ a.b);
	const baz = $derived(a.b /* kept */ + 1);
	const qux = $derived(/** @type {number} */ (a.b));
	const quux = $derived(/* kept */ a.b);
	const corge = $derived(a.b /* kept */);
	const grault = $derived.by(() => {
		return a.b; // lost
	});
	const garply = $derived.by((/* lost */) => a.b);
</script>

{foo}{bar}{baz}{qux}{quux}{corge}{grault}{garply}
