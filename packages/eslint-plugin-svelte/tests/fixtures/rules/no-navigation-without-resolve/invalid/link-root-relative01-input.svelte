<script>
	import { resolve } from '$app/paths';

	const slug = 'hello';
</script>

<a href="/about">Click me!</a>
<a href={'/about'}>Click me!</a>
<a href="/blog/{slug}">Click me!</a>
<a href={`/blog/${slug}`}>Click me!</a>
<a href={'/blog/' + slug}>Click me!</a>
<a href="/about?tab=1#top">Click me!</a>
<a href="  /about">Click me!</a>
<a href="/about" data-sveltekit-reload>Click me!</a>
<a href="/about" target="_blank">Click me!</a>
<a href="/about" download>Click me!</a>
<a href="/about" rel="EXTERNAL">Click me!</a>
<a href="/about" rel="external-link">Click me!</a>
<area href="/about" />
<svg><a href="/about"><text>Click me!</text></a></svg>
<svg><a xlink:href="/about"><text>Click me!</text></a></svg>
