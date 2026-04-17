<script>
	let focused = $state(false);
	let value = $state('');
</script>

<!-- bind:value before bind:focused is wrong (line-length desc: bind:focused is longer) -->
<input bind:focused={focused} bind:value={value} a="1" b="2" />
