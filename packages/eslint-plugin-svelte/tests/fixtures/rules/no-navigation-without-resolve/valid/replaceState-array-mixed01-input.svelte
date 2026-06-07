<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const paths = [resolve('/'), 'https://example.com'];
	replaceState(paths[0]);
</script>
