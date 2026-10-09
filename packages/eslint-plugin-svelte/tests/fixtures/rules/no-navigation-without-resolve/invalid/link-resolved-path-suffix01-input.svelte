<script>
	import { resolve } from '$app/paths';

	const resolved = resolve('/foo');
	const path = '/bar';
</script>

<a href={resolve('/foo') + '/bar'}>Click me!</a>
<a href={`${resolved}${path}`}>Click me!</a>
<a href="{resolve('/foo')}/evil">Click me!</a>
<a href="{resolved}{path}">Click me!</a>
<a href="{resolved}{''}/bar?query=param">Click me!</a>
