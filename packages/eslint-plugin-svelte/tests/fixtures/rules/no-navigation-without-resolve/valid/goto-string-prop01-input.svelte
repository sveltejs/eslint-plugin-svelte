<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		href: string;
	}

	const { href }: Props = $props();

	goto(href);
</script>
