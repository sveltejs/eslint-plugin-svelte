<script>
	import Child from './Child.svelte';
	export let value;
	export let html;
</script>

<!-- svelte-ignore ownership-invalid-binding -->
<Child bind:value />

<!-- svelte-ignore hydration-attribute-changed -->
<img src={html} alt="" />
