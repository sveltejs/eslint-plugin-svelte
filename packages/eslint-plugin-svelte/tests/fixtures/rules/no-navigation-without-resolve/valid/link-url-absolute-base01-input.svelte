<script>
	import { page } from '$app/state';
	const target = getTarget();
	const base = new URL('https://svelte.dev');
</script>

<a href={new URL(target).href}>One</a>
<a href={new URL('https://svelte.dev/blog', page.url).href}>Two</a>
<a href={new URL('/blog', base).href}>Three</a>
<a href={new URL('/blog', 'https://svelte.dev').href}>Four</a>
<a href={new URL('/blog', base.href)}>Five</a>
