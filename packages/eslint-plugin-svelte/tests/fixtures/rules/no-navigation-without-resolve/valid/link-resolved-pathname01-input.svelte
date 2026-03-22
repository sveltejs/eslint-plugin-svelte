<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
