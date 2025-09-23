<script>
	import { asset } from '$app/paths';

	const value = asset('/foo/');
</script>

<a href={asset('/foo/')}>Click me!</a>
<a href={value}>Click me!</a>
