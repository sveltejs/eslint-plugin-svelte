<script>
	import { resolve } from '$app/paths';

	const base = [resolve('/a')];
	const paths = [...base, resolve('/ok')];
</script>

<a href={paths[1]}>Link</a>
