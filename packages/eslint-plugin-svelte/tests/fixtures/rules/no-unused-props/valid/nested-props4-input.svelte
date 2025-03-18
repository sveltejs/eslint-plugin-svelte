<script lang="ts">
	import GenericPopout from './GenericPopout.svelte';

	let {
		wrapper
	}: {
		wrapper: {
			position: {
				x: number;
				y: number;
			};
		};
	} = $props();
</script>

<GenericPopout x={wrapper.position.x}>Test</GenericPopout>
<GenericPopout position={wrapper.position}>Test</GenericPopout>
