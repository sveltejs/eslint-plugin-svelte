<script lang="ts">
	import Child from './Child.svelte';
</script>

<!-- This second call site omits `p`, but AppA passes it, so it is not useless. -->
<Child />
