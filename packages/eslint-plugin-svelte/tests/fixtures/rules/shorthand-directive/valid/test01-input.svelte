<script>
	let value = 'hello!';
	let active = true;
	let color = 'red';
	let foo = 42;
</script>

<!-- ✓ GOOD -->
<input bind:value />
<div class:active>...</div>
<div style:color>...</div>

<input bind:value={foo} />
<div class:active={foo}>...</div>
<div style:color={foo}>...</div>
<div style:color="r{foo}">...</div>
<div style:color="red">...</div>
