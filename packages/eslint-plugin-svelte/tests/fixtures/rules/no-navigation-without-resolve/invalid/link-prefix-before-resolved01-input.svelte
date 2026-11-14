<script>
	import { resolve, base } from '$app/paths';
	import { page } from '$app/state';

	const lang = 'en';
</script>

<!-- During SSR, resolve() can return `./foo`, so anything before it breaks the URL. -->
<a href="{page.url.origin}{resolve('/foo')}">Click me!</a>
<a href={`${page.url.origin}${resolve('/foo')}`}>Click me!</a>
<a href={'https://example.com' + resolve('/foo')}>Click me!</a>
<a href={'/' + lang + resolve('/foo')}>Click me!</a>
<a href="{page.url.origin}{base}/foo">Click me!</a>
<a href={'/en' + page.url.pathname}>Click me!</a>
