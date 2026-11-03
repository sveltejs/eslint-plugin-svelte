<script lang="ts">
	import { resolve } from '$app/paths';

	const { url, show }: { url?: string; show: boolean } = $props();
</script>

<a href={url ?? resolve('/')}>Click me!</a>
<a href={url || resolve('/')}>Click me!</a>
<a href={url ?? '#'}>Click me!</a>
<a href={show ? resolve('/a') : resolve('/b')}>Click me!</a>
<a href={resolve('/') ?? '/never'}>Click me!</a>
<a href={resolve('/') || '/never'}>Click me!</a>
