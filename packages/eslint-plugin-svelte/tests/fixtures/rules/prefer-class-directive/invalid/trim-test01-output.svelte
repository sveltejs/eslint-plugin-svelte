<script>
	let current = 'foo';
	let active = true;
</script>

<button class="{current === 'foo' ? 'selected' : ''}" class:active={active}>foo</button>

<!-- trim-test01-input.svelte -->
