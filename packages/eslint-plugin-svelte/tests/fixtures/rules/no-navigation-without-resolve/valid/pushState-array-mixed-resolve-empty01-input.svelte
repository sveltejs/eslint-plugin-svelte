<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const paths = [resolve('/'), ''];
	pushState(paths[0]);
	pushState(paths[1]);
</script>
