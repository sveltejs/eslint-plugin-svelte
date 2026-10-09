<script>
	import { resolve } from '$app/paths';

	const front = ['/bad', '/bad2'];
	const paths = [...front, resolve('/ok')];
</script>

<a href={paths[1]}>Link</a>
