<script>
	import { asset } from '$app/paths';
</script>

<a href={asset('/foo') + '/bar'}>Click me!</a>
<a href={'/foo' + asset('/bar')}>Click me!</a>
