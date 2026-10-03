<script lang="ts">
	class A {
		public variable = new Set([1, 2, 1, 3, 3]);

		public fn() {
			return 42;
		}
	}

	const a = new A();
</script>

{a.fn()}
