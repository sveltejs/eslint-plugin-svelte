<script lang="ts">
	class A {
		private variable = new Set([1, 2, 1, 3, 3]);

		public fn() {
			return this.variable;
		}
	}

	const a = new A();
</script>

{a.fn().has(42)}
