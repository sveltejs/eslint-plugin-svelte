<script>
	import { resolve } from '$app/paths';
	import Nav from './Nav.svelte';

	const main = [{ href: '/a' }];
	const all = [...main];
	all.forEach((l) => {
		l.href = resolve(l.href);
	});

	const nav = { home: { href: '/b' } };
	const copy = { ...nav };
	copy.home.href = resolve('/b');

	const links = [{ href: '/c' }];
	function fix(l) {
		l.href = resolve(l.href);
	}

	const items = [{ href: '/d' }];
</script>

{#each main as l, i (i)}
	<a href={l.href}>A</a>
{/each}
<a href={nav.home.href}>B</a>
{#each links as l, i (i)}
	{fix(l)}
{/each}
<a href={links[0].href}>C</a>
<svelte:component this={Nav} {items} />
<a href={items[0].href}>D</a>
