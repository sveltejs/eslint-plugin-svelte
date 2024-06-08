<script>
	import Component from './Component.svelte';
	let current = 'foo';
</script>

<Component class={current === 'foo' ? 'selected' : ''} />
