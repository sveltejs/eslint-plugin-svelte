<script>
	import { resolve } from '$app/paths';

	const paths = [resolve('/'), '/about'];
</script>

{#each paths as path}
	<a href={path}>Click me</a>
{/each}
