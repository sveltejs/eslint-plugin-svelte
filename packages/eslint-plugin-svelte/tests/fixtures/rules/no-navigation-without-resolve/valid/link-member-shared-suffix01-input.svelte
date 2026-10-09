<script>
	import { resolve } from '$app/paths';

	const routes = { home: resolve('/'), query: '?query=param' };
	const navItems = [
		{ name: 'Home', url: resolve('/'), hash: '#top' },
		{ name: 'About', url: resolve('/about'), hash: '#team' }
	];
</script>

<a href={routes.home + routes.query}>Home</a>
<a href="{routes.home}{routes.query}">Home</a>

{#each navItems as item}
	<a href={item.url + item.hash}>{item.name}</a>
	<a href="{item.url}{item.hash}">{item.name}</a>
{/each}

{#each navItems as { name, url, hash }}
	<a href={url + hash}>{name}</a>
{/each}
