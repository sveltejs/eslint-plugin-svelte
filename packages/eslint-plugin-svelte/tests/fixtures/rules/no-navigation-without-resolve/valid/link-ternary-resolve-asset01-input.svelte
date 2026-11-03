<script>
	import { resolve, asset } from '$app/paths';

	let { condition } = $props();
	const url = condition ? resolve('/foo') : asset('/bar');
	const assetUrl = asset('/bar');
</script>

<a href={condition ? resolve('/foo') : asset('/bar')}>Click me!</a>
<a href={condition ? asset('/bar') : resolve('/foo')}>Click me!</a>
<a href={condition ? asset('/foo') : asset('/bar')}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? resolve('/foo') : assetUrl}>Click me!</a>
