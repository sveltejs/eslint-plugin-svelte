<script>
	class A {
		#variable = new Set([1, 2, 1, 3, 3]);

		#fn() {
			return this.#variable;
		}

		fn2() {
			return this.#fn();
		}
	}

	const a = new A();
</script>

{a.fn2().has(42)}
