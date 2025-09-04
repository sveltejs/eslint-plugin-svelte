<script lang="ts">
	import { goto } from '$app/navigation';

	type ResolvedPathname = string;

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();

	goto(href);
</script>
