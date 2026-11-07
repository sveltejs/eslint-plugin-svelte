<script lang="ts">
	import { goto, pushState } from '$app/navigation';
	import { resolve, asset, base } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		r: ResolvedPathname;
		maybe?: ResolvedPathname;
		nullable: ResolvedPathname | null;
		u: URL & { pathname: ResolvedPathname };
	}

	const { r, maybe, nullable, u }: Props = $props();
	const items = [{ href: resolve('/a') }, { href: resolve('/b') }];

	goto(r);
	goto(u);
	goto(page.url);
	goto(resolve('/a') + '?q=1');
	goto('/x' as ResolvedPathname);
	pushState('', {});
</script>

<a href={r}>Click me!</a>
<a href={maybe}>Click me!</a>
<a href={nullable}>Click me!</a>
<a href={r + '#top'}>Click me!</a>
<a href={asset('/a.pdf')}>Click me!</a>
<a href="{base}/old">Click me!</a>
<a href="https://svelte.dev">Click me!</a>
<a href={page.url.pathname + '/edit'}>Click me!</a>
{#each items as item}
	<a href={item.href}>Click me!</a>
{/each}
