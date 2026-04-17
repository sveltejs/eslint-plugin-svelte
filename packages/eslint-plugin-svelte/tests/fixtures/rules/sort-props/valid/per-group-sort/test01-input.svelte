<script>
	let focused = $state(false);
	let value = $state('');
</script>

<input bind:focused={focused} bind:value={value} a="1" b="2" />
