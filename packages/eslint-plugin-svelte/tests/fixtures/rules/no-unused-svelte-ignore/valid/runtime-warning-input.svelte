<script>
	import Child from './Child.svelte';
	let { value = $bindable() } = $props();
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Child bind:value />
