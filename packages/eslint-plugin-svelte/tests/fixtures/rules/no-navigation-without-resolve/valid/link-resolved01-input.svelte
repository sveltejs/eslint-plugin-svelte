<script>
	import { resolve } from '$app/paths';

	const value = resolve('/foo/');
</script>

<a href={resolve('/foo/')}>Click me!</a>
<a href={value}>Click me!</a>
