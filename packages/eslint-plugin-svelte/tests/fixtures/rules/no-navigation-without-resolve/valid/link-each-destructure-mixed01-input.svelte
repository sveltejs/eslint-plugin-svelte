<script>
	import { resolve } from '$app/paths';

	const navItems = [
		{ name: 'Home', url: resolve('/') },
		{ name: 'Google', url: 'https://google.com' },
	];
</script>

{#each navItems as { name, url }}
	<a href={url}>{name}</a>
{/each}
