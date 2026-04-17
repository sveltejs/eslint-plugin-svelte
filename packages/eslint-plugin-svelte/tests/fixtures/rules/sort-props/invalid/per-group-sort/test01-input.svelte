<script>
	let focused = $state(false);
	let value = $state('');
</script>

<!-- bind:value before bind:focused is wrong (line-length desc: bind:focused is longer) -->
<input bind:value={value} bind:focused={focused} a="1" b="2" />
