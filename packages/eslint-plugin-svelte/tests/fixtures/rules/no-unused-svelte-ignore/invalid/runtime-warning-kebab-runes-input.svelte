<script>
	import Child from './Child.svelte';
	let { value = $bindable() } = $props();
</script>

<!-- svelte-ignore ownership-invalid-binding -->
<Child bind:value />
