<script lang="ts">
	class A {
		private variable = new Set([1, 2, 1, 3, 3]);

		private fn() {
			return this.variable;
		}

		public fn2() {
			return this.fn();
		}
	}

	const a = new A();
</script>

{a.fn2().has(42)}
