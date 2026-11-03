<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';

	const { slug, r }: { slug: string; r: ResolvedPathname } = $props();
</script>

<a href={resolve('/blog') + '/' + slug}>Click me!</a>
<a href={`${resolve('/blog')}/${slug}`}>Click me!</a>
<a href="{resolve('/blog')}/{slug}">Click me!</a>
<a href={resolve('/') + 'about'}>Click me!</a>
<a href={resolve('/') + resolve('/about')}>Click me!</a>
<a href={r + '/edit'}>Click me!</a>
<a href={asset('/img') + '.png'}>Click me!</a>
<a href={resolve('/') + (slug ? '?a' : '/b')}>Click me!</a>
