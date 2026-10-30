<script>
	const fn = () => {
		const variable = new Set([1, 2, 1, 3, 3]);
		return variable;
	}
</script>

{fn().has(42)}
