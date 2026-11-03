<script lang="ts">
	import type { Pathname } from '$app/types';

	import { pushState } from '$app/navigation';

	interface Props {
		href: Pathname;
	}

	const { href }: Props = $props();

	pushState(href);
</script>
