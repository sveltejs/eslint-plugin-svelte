<script>
	import { resolve } from '$app/paths';

	const value = resolve('/foo') + '/bar';
</script>

<a href={resolve('/foo') + '/bar'}>Click me!</a>
<a href={'/foo' + resolve('/bar')}>Click me!</a>
<a href={value}>Click me!</a>
