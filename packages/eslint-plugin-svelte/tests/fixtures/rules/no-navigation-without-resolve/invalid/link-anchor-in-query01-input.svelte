<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	goto('/login?next=' + page.url.pathname);
</script>

<!-- The path itself has no base path. -->
<a href="/login?next={resolve('/dashboard')}">Click me!</a>
