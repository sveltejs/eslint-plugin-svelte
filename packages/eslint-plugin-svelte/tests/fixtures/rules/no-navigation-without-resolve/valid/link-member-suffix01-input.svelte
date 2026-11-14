<script>
	import { resolve } from '$app/paths';

	const paths = [resolve('/'), resolve('/about')];
	const routes = { home: resolve('/') };
	const navItems = [
		{ name: 'Home', url: resolve('/') },
		{ name: 'About', url: resolve('/about') }
	];
	const query = '?query=param';
</script>

<a href={paths[0] + '?query=param'}>Home</a>
<a href="{paths[1]}#fragment">About</a>
<a href={routes.home + query}>Home</a>

{#each navItems as item}
	<a href={item.url + '?query=param'}>{item.name}</a>
	<a href="{item.url}#fragment">{item.name}</a>
{/each}

{#each navItems as { name, url }}
	<a href={url + query}>{name}</a>
{/each}

{#each paths as path}
	<a href="{path}?query=param">Link</a>
{/each}
