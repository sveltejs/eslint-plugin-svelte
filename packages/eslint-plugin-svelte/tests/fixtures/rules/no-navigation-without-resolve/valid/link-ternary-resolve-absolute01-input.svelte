<script>
	import { resolve } from '$app/paths';

	const condition = true;
	const url = condition ? resolve('/foo') : 'https://example.com';
	const absUrl = 'https://example.com';
</script>

<a href={condition ? resolve('/foo') : 'https://example.com'}>Click me!</a>
<a href={condition ? 'https://example.com' : resolve('/foo')}>Click me!</a>
<a href={condition ? 'https://example.com' : 'https://other.com'}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? resolve('/foo') : absUrl}>Click me!</a>
