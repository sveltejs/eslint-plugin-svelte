<script>
	import ComponentWithSnippet from './ComponentWithSnippet.svelte';
</script>

<ComponentWithSnippet>
	{#snippet children()}
		<AnotherComponentWithSnippet>
			{#snippet children()}
				Hello!
			{/snippet}
		</AnotherComponentWithSnippet>
	{/snippet}
</ComponentWithSnippet>
