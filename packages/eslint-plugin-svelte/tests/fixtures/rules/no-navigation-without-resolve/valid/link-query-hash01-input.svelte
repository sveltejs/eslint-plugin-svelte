<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';

	const { r, q }: { r: ResolvedPathname; q: string } = $props();
</script>

<a href="?page=2">Click me!</a>
<a href="#top">Click me!</a>
<a href="">Click me!</a>
<a href>Click me!</a>
<a href={resolve('/search') + '?q=svelte'}>Click me!</a>
<a href={`${resolve('/search')}?q=${q}`}>Click me!</a>
<a href="{resolve('/search')}?q={q}">Click me!</a>
<a href={resolve('/docs') + '#intro'}>Click me!</a>
<a href={r + '?q=1'}>Click me!</a>
<a href={`${r}#top`}>Click me!</a>
<a href={resolve('/') + (q ? '?a' : '#b')}>Click me!</a>
