<script>
	import { page } from '$app/state';
	import * as state from '$app/state';
	import { page as pageStore } from '$app/stores';
	import { base, assets } from '$app/paths';
</script>

<a href={page.url.href}>Click me!</a>
<a href={page.url.pathname}>Click me!</a>
<a href={`${page.url.pathname}/edit`}>Click me!</a>
<a href={page.url.pathname + '?tab=1'}>Click me!</a>
<a href={state.page.url.pathname + '/edit'}>Click me!</a>
<a href={$pageStore.url.pathname + '/edit'}>Click me!</a>
<a href="{base}/about">Click me!</a>
<a href={`${base}/about`}>Click me!</a>
<a href="{assets}/file.pdf">Click me!</a>
<a href={`${page.url.origin}${page.url.pathname}`}>Click me!</a>
<a href={page.url.origin + page.url.pathname + '?tab=1'}>Click me!</a>
