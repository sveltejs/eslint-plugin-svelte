<script>
	import { resolve } from '$app/paths';

	const navItems = [
		{ name: 'Home', url: resolve('/') },
		{ name: 'Google', url: 'https://google.com' },
	];
</script>

{#each navItems as item}
	<a href={item.url}>{item.name}</a>
{/each}
