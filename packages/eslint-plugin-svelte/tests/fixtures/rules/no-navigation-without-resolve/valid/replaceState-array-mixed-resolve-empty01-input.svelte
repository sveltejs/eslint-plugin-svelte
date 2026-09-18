<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const paths = [resolve('/'), ''];
	replaceState(paths[0]);
	replaceState(paths[1]);
</script>
