<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ResolvedPathname } from '$app/types';

	let { href }: { href: ResolvedPathname } = $props();
	goto(href);
	if (href === '/') goto(href);
</script>

<a {href}>Home</a>
