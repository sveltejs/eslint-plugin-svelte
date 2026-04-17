<script>
	let isActive = $state(false);
	let value = $state('');
	const handle = () => {};
</script>

<input class:active={isActive} bind:value={value} a="1" b="2" onclick={handle} />
