<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	// resolve() / page.url inside the query or the hash does not decide the path.
	goto(`?next=${resolve('/dashboard')}`);
	goto('?next=' + page.url.pathname);
</script>

<a href="?next={page.url.pathname}">Click me!</a>
<a href="?next={resolve('/dashboard')}">Click me!</a>
<a href="#{resolve('/x')}">Click me!</a>
<a href="https://twitter.com/intent/tweet?url={resolve('/x')}">Click me!</a>
<a href="mailto:?body={resolve('/x')}">Click me!</a>
<a href="{resolve('/login')}?next={resolve('/dashboard')}">Click me!</a>
