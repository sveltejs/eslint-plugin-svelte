<script>
	let value = 'hello!';
	let active = true;
	let color = 'red';
</script>

<!-- ✓ GOOD -->
<!-- prettier-ignore -->
<input bind:value={value}>
<!-- prettier-ignore -->
<div class:active={active}>...</div>
<!-- prettier-ignore -->
<div style:color={color}>...</div>
