<svelte:options runes />

<script>
	const seen = new Set();
	seen.add(1);
</script>

{seen.size}
