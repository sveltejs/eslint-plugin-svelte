<script>
	let value = 'hello!';
	let active = true;
	let color = 'red';
</script>

<!-- ✓ GOOD -->
<input bind:value={value} />
<div class:active={active}>...</div>
<div style:color={color}>...</div>

<!-- ✗ BAD -->
<!-- prettier-ignore -->
<input bind:value={value}>
<!-- prettier-ignore -->
<div class:active={active}>...</div>
<!-- prettier-ignore -->
<div style:color={color}>...</div>
