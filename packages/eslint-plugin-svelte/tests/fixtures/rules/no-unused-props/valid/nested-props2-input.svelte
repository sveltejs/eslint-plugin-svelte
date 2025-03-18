<script lang="ts">
	import GenericPopout from './GenericPopout.svelte';

	let {
		position
	}: {
		position: {
			x: number;
			y: number;
		};
	} = $props();
</script>

<GenericPopout {position}>Test</GenericPopout>
