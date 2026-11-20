<script>
	import { page } from '$app/state';
	const base = getBase();
	const relative = new URL('/x', page.url);
</script>

<a href={new URL('/blog', page.url).href}>One</a>
<a href={new URL('/blog', location.origin).href}>Two</a>
<a href={new URL('/blog', base).href}>Three</a>
<a href={new URL('/blog', relative).href}>Four</a>
<a href={relative.href}>Five</a>
<a href={new URL(...parts).href}>Six</a>
