<script lang="ts">
	import { pushState } from '$app/navigation';

	interface Props {
		href: string;
	}

	const { href }: Props = $props();

	pushState(href);
</script>
