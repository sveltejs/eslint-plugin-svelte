<script lang="ts">
	import Child from './Child.svelte';

	// `Child` is read as a value, so its prop profile is unknowable -> never flag.
	const Dyn = Child;
</script>

<svelte:component this={Dyn} />
