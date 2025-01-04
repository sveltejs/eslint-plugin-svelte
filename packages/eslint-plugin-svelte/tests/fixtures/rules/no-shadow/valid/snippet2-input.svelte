<script>
	import ComponentWithSnippet from './ComponentWithSnippet.svelte';
	const children = 1;
</script>

<ComponentWithSnippet>
	{#snippet children()}
		Hello!
	{/snippet}
</ComponentWithSnippet>
