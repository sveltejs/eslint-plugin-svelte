<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();
</script>

<a href={href + '?a=1'}>Click me!</a>
<a href={`${href}#x`}>Click me!</a>
<a href="{href}?a=1">Click me!</a>
