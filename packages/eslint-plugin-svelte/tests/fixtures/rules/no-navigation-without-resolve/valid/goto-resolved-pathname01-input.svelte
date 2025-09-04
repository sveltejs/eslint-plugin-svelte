<script lang="ts">
	import { type ResolvedPathname } from '$app/types';
	import { goto } from '$app/navigation';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	goto(href);
</script>
