<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const url = new URL(page.url);
	url.searchParams.set('q', 'x');
	url.hash = 'top';
	goto(url);
</script>
