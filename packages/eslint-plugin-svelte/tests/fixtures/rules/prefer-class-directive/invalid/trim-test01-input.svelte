<script>
	let current = 'foo';
	let active = true;
</script>

<button class="{active ? 'active' : ''} {current === 'foo' ? 'selected' : ''}">foo</button>

<!-- trim-test01-input.svelte -->
