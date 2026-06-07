<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const paths = [resolve('/'), resolve('/about')];
	goto(paths[0]);
	goto(paths[1]);
</script>
