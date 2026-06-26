<script lang="ts">
	import Child from './Child.svelte';
</script>

<!-- `used` is passed here; `unused` is never passed by any call site. -->
<Child used="hi" />
