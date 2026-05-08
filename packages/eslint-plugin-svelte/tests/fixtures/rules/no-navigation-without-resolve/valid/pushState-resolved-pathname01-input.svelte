<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { pushState } from '$app/navigation';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	pushState(href);
</script>
