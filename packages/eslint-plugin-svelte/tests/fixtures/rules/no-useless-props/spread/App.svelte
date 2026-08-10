<script lang="ts">
	import Box from './Box.svelte';

	const rest: Record<string, unknown> = {};
</script>

<!-- An opaque spread may set any prop, so none of Box's props can be flagged. -->
<Box {...rest} />
