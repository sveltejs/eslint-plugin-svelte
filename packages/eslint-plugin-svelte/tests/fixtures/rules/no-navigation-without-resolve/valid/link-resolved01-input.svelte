<script>
	import { resolve } from '$app/paths';

	const value = resolve('/foo/');
	const href = resolve('/foo/');
</script>

<a href={resolve('/foo/')}>Click me!</a>
<a href={value}>Click me!</a>
<a {href}>Click me!</a>

<!-- Testing for attribute without value. -->
<input type="text" disabled />
