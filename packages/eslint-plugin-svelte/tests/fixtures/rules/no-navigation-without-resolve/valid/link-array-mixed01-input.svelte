<script>
	import { resolve } from '$app/paths';

	const paths = [resolve('/'), 'https://example.com'];
</script>

{#each paths as path}
	<a href={path}>Click me</a>
{/each}
