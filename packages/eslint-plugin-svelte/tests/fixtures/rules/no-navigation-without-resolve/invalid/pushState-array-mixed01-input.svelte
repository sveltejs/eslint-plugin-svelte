<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const paths = [resolve('/'), 'https://example.com'];
	pushState(paths[1]);
</script>
