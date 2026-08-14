<script>
	class A {
		#variable = new Set([1, 2, 1, 3, 3]);

		#fn() {
			this.#variable.add(42);
			return this.#variable;
		}

		fn2() {
			this.#fn();
			return 42;
		}
	}

	const a = new A();
</script>

{a.fn2()}
