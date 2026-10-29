<script>
	import { resolve } from '$app/paths';

	const navItems = [
		{ name: 'Home', url: resolve('/') },
		{ name: 'About', url: resolve('/about') },
	];
</script>

{#each navItems as { name, url }}
	<a href={url}>{name}</a>
{/each}
