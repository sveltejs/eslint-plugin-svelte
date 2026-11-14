<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const url = new URL('/', page.url);
	url.pathname = resolve('/foo');
	goto(url);
</script>
