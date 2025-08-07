<script>
	import { resolve } from '$app/paths';
</script>

<a href={resolve('/foo') + '/bar'}>Click me!</a>
<a href={'/foo' + resolve('/bar')}>Click me!</a>
