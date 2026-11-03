<script>
	import Child from './Child.svelte';
	let { value = $bindable() } = $props();
</script>

<!-- svelte-ignore a11y_autofocus ownership_invalid_binding -->
<Child bind:value />

<!-- svelte-ignore a11y_autofocus , ownership_invalid_binding -->
<Child bind:value />

<!-- svelte-ignore (reason) ownership_invalid_binding -->
<Child bind:value />
