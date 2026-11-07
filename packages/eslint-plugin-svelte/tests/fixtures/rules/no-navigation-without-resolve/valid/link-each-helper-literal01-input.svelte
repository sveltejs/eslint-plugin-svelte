<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	function localize<T extends string>(p: T): T {
		return (base + p) as T;
	}
	function link<T extends string>(p: T): { href: T } {
		return { href: (base + p) as T };
	}
	const PATHS = ['/a', '/b'] as const;
	const nav = $derived(PATHS.map((p) => localize(p)));
	const links = [link('/a'), link('/b')];
	for (const href of PATHS.map((p) => localize(p))) goto(href);
	PATHS.map((p) => localize(p)).forEach((href) => goto(href));
</script>

{#each nav as href, i (i)}
	<a {href}>A</a>
{/each}
{#each PATHS.map(localize) as href, i (i)}
	<a {href}>A</a>
{/each}
{#each links as { href }, i (i)}
	<a {href}>A</a>
{/each}
{#each links as l, i (i)}
	<a href={l.href}>A</a>
{/each}
