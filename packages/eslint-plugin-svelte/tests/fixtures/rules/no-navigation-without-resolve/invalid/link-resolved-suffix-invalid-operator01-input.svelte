<script>
	import { resolve } from '$app/paths';

	const resolved = resolve('/foo');
	const query = '?foo=bar';
</script>

<a href={resolve('/foo') - '?foo=bar'}>Click me!</a>
<a href={resolve('/foo') - '#section'}>Click me!</a>
<a href={resolve('/foo') - ''}>Click me!</a>
<a href={resolved - '?foo=bar'}>Click me!</a>
<a href={resolve('/foo') - query}>Click me!</a>
<a href={resolve('/foo') + '?' - 'foo=bar'}>Click me!</a>
<a href={resolve('/foo') - '?' + 'foo=bar'}>Click me!</a>
<a href={resolve('/foo') + ('?' - 'foo=bar')}>Click me!</a>
