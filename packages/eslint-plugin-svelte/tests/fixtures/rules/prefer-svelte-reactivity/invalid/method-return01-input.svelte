<script>
	class A {
		fn() {
			const variable = new Set([1, 2, 1, 3, 3]);
			return variable;
		}
	}

	const a = new A();
</script>

{a.fn().has(42)}
