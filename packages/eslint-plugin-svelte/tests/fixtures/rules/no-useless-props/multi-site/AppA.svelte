<script lang="ts">
	import Child from './Child.svelte';
</script>

<!-- One of two call sites passes `p`; that is enough for it to be "used". -->
<Child p="hi" />
