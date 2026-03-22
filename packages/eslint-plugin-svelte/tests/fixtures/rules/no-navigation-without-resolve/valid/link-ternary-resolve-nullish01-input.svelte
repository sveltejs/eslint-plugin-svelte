<script>
	import { resolve } from '$app/paths';

	const condition = true;
	const url = condition ? resolve('/foo') : null;
	const nullish = null;
</script>

<a href={condition ? resolve('/foo') : null}>Click me!</a>
<a href={condition ? null : resolve('/foo')}>Click me!</a>
<a href={condition ? null : undefined}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? resolve('/foo') : nullish}>Click me!</a>
