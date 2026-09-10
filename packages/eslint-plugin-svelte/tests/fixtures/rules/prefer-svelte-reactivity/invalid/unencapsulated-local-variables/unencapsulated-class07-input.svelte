<script>
	class A {
		fn() {
			const value = new Set([1, 2, 1, 3, 3]);
			return value
		}
	}

	const a = new A();
</script>

{a.fn().has(42)}
