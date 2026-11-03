<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { replaceState } from '$app/navigation';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	replaceState(href);
</script>
