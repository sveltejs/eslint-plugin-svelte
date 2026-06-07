<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const paths = [resolve('/'), resolve('/about')];
	pushState(paths[0]);
	pushState(paths[1]);
</script>
