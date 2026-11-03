<script>
	const { id } = $props();
	const seen = new Set();
	seen.add(id);
</script>

{seen.size}
