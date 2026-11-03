<script>
	import { asset } from '$app/paths';

	let { condition } = $props();
</script>

<a href={condition ? asset('/foo') : '/bar'}>Click me!</a>
<a href={condition ? '/foo' : asset('/bar')}>Click me!</a>
