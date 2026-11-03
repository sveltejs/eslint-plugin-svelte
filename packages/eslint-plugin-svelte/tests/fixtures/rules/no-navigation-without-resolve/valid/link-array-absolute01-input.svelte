<script>
	const urls = ['https://google.com', 'https://bing.com'];
</script>

{#each urls as url}
	<a href={url}>Click me</a>
{/each}
