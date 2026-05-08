<script lang="ts">
	import type { Pathname } from '$app/types';

	import { goto } from '$app/navigation';

	interface Props {
		href: Pathname;
	}

	const { href }: Props = $props();

	goto(href);
</script>
