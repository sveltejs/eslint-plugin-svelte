<script>
	import { resolve } from '$app/paths';

	const resolved = resolve('/foo');
</script>

<a href={`${resolve('/foo')}`}>Click me!</a>
<a href={`${resolved}`}>Click me!</a>
