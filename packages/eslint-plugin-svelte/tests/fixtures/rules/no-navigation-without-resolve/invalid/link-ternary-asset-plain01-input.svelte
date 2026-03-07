<script>
	import { asset } from '$app/paths';

	const condition = true;
</script>

<a href={condition ? asset('/foo') : '/bar'}>Click me!</a>
<a href={condition ? '/foo' : asset('/bar')}>Click me!</a>
