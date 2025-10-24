<script>
	import { resolve } from '$app/paths';

	const base = resolve('/foo');
</script>

<a href={resolve('/foo') + '?q=1'}>Click me!</a>
<a href={`${resolve('/bar')}#frag`}>Click me!</a>
<a href={base + '&x=1'}>Click me!</a>


