<script>
	class A {
		fn() {
			return new Set([1, 2, 1, 3, 3]);
		}
	}

	const a = new A();
</script>

{a.fn().has(42)}
