<script lang="ts">
	class A {
		private variable = new Set([1, 2, 1, 3, 3]);

		public fn() {
			this.variable.add(42);
			return 42;
		}
	}

	const a = new A();
</script>

{a.fn()}
