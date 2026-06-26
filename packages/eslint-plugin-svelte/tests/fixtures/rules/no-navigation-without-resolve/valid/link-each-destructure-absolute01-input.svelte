<script>
	const navItems = [
		{ name: 'Google', url: 'https://google.com' },
		{ name: 'Bing', url: 'https://bing.com' },
	];
</script>

{#each navItems as { name, url }}
	<a href={url}>{name}</a>
{/each}
