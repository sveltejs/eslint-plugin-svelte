<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(function () {
		return this;
	});
	const bar = $derived.by(function () {
		return arguments.length;
	});
	const baz = $derived.by(function () {
		return new.target;
	});
	const qux = $derived.by(function f() {
		return typeof f;
	});
	const quux = $derived.by(function () {
		return () => arguments.length;
	});
	const corge = $derived.by(function f() {
		return a.b;
	});
	const grault = $derived.by(function () {
		return function () {
			return this;
		};
	});
</script>

{foo}{bar}{baz}{qux}{quux}{corge}{grault}
