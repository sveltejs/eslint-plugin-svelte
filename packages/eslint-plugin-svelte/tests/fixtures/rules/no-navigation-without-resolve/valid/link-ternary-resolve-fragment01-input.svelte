<script>
	import { resolve } from '$app/paths';

	const condition = true;
	const url = condition ? resolve('/foo') : '#section';
	const fragment = '#section';
</script>

<a href={condition ? resolve('/foo') : '#section'}>Click me!</a>
<a href={condition ? '#section' : resolve('/foo')}>Click me!</a>
<a href={condition ? '#section' : '#other'}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? resolve('/foo') : fragment}>Click me!</a>
