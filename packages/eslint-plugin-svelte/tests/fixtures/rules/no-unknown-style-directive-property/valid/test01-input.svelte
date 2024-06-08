<script>
	let red = 'red';
	let color = red;
</script>

<div style:color={red}>...</div>
<div style:color>...</div>
<div style="unknown-color: red">...</div>
<div style:--color={red}>...</div>

<style>
	:root {
		--color: blue;
	}
	div {
		color: var(--color);
	}
</style>
