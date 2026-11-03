<script>
	import Child from './Child.svelte';
	let { value = $bindable() } = $props();
</script>

<!-- svelte-ignore ownership_invalid_binding, a11y_autofocus -->
<Child bind:value />
