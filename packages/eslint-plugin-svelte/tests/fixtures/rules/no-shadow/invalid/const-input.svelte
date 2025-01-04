<script>
	import ComponentWithSnippet from './ComponentWithSnippet.svelte';
</script>

<ComponentWithSnippet>
	{@const foo = 1}
	<ComponentWithSnippet>
		{@const foo = 2}
	</ComponentWithSnippet>
</ComponentWithSnippet>
