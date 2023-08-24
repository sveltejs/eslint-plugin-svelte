<script>
	let expression = 'div';
	let current = 'foo';
</script>

<svelte:element this={expression} class={current === 'foo' ? 'selected' : ''} />
