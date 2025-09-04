<script lang="ts">
	import { replaceState } from '$app/navigation';

	interface Props {
		href: string;
	}

	const { href }: Props = $props();

	replaceState(href);
</script>
