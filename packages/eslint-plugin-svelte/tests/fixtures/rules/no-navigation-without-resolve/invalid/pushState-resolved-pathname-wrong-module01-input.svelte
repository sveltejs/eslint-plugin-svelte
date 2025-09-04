<script lang="ts">
	import { pushState } from '$app/navigation';

	type ResolvedPathname = string;

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	pushState(href);
</script>
