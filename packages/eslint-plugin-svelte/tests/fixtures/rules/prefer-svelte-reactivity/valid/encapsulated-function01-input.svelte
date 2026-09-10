<script>
	function fn() {
		const variable = new Set([1, 2, 1, 3, 3]);
		variable.add(42);
		return 42;
	}
</script>

{fn()}
