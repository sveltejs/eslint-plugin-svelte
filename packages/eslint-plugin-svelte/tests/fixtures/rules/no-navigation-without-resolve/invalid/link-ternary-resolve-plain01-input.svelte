<script>
	import { resolve } from '$app/paths';

	const condition = true;
	const url = condition ? resolve('/foo') : '/bar';
	const plain = '/bar';
</script>

<a href={condition ? resolve('/foo') : '/bar'}>Click me!</a>
<a href={condition ? '/foo' : resolve('/bar')}>Click me!</a>
<a href={condition ? '/foo' : '/bar'}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? resolve('/foo') : plain}>Click me!</a>
