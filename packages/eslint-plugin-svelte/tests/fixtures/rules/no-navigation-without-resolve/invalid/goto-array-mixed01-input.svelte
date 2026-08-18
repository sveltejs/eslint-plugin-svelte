<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const paths = [resolve('/'), 'https://example.com'];
	goto(paths[1]);
</script>
