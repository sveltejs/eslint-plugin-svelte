<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const url = new URL(page.url);
	goto(resolve('/about') + page.url.search);
	goto(`${resolve('/about')}${page.url.hash}`);
	goto(resolve('/a') + location.search);
	goto(resolve('/a') + url.search);
</script>

<a href="{resolve('/about')}{page.url.search}">About</a>
