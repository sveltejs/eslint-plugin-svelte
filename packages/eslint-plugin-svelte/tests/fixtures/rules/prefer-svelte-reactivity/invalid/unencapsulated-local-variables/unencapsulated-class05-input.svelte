<script>
	class A {
		variable = new Set([1, 2, 1, 3, 3]);

		fn() {
			return 42;
		}
	}

	const a = new A();
</script>

{a.fn()}
