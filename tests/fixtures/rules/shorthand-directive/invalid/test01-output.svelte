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
<input bind:value>
<!-- prettier-ignore -->
<div class:active>...</div>
<!-- prettier-ignore -->
<div style:color>...</div>
