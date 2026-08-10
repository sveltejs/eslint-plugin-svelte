<script lang="ts">
	import Box from './Box.svelte';

	let bound = $state('');
</script>

<Box attr="x" bind:bound>
	body content sets `children`
	{#snippet head()}heading{/snippet}
</Box>
