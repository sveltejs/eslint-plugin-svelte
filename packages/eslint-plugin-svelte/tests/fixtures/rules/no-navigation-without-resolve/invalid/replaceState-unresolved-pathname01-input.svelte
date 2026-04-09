<script lang="ts">
	import type { Pathname } from '$app/types';

	import { replaceState } from '$app/navigation';

	interface Props {
		href: Pathname;
	}

	const { href }: Props = $props();

	replaceState(href);
</script>
