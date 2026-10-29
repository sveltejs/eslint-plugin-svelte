<script>
	import { resolve } from '$app/paths';

	const paths = [resolve('/'), resolve('/about')];
	const navItems = [
		{ name: 'Home', url: resolve('/') },
		{ name: 'About', url: '/about' }
	];
</script>

<a href={paths[0] + '/evil'}>Home</a>
<a href="{paths[1]}/evil?query=param">About</a>

{#each navItems as item}
	<a href={item.url + '?query=param'}>{item.name}</a>
{/each}

{#each paths as path}
	<a href="{path}/evil">Link</a>
{/each}
