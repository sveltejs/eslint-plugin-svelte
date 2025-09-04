<script lang="ts">
	import type { ComponentProps } from 'svelte';

	interface Props extends ComponentProps<any> {
		a: string;
	}

	let { a }: Props = $props();
</script>

<p>{a}</p>
