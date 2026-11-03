<script lang="ts">
	import type { Pathname } from '$app/types';

	interface Props {
		href: Pathname;
	}

	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
