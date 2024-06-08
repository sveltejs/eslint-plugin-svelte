<script>
	let foo = Math.random();
	let current = 'foo';
</script>

<div>
	{#if foo > 0.5}
		<svelte:self class={current === 'foo' ? 'selected' : ''} />
	{/if}
</div>
