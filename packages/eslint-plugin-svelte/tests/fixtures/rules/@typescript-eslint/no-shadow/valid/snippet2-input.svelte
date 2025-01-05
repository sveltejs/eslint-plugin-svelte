<script lang="ts">
	import ComponentWithSnippet from './ComponentWithSnippet.svelte';
	const children: number = 1;
</script>

<ComponentWithSnippet>
	{#snippet children()}
		Hello!
	{/snippet}
</ComponentWithSnippet>
