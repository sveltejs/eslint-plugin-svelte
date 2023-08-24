<script>
	let value = 'hello!';
	let active = true;
	let color = 'red';
</script>

<!-- ✓ GOOD -->
<input bind:value />
<div class:active>...</div>
<div style:color>...</div>

<!-- ✗ BAD -->
<!-- prettier-ignore -->
<input bind:value={value}>
<!-- prettier-ignore -->
<div class:active={active}>...</div>
<!-- prettier-ignore -->
<div style:color={color}>...</div>

<!-- prettier-ignore -->
<div class:active="{active}">...</div>
<!-- prettier-ignore -->
<div style:color="{color}">...</div>
