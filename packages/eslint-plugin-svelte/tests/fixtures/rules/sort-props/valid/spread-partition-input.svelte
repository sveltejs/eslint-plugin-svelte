<script>
	let value = $state('');
	const handle = () => {};
	const rest = {};
</script>

<input a="1" b="2" {...rest} bind:value={value} c="x" d="y" onclick={handle} />
