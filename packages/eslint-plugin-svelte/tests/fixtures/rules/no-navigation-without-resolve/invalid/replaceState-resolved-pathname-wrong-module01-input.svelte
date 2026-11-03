<script lang="ts">
	import { replaceState } from '$app/navigation';

	type ResolvedPathname = string;

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	replaceState(href);
</script>
