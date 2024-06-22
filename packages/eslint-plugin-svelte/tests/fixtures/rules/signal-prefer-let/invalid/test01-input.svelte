<script>
	const { prop } = $props();
	const state = $state();
	const derived = $derived(state + 1);
	const derivedBy = $derived.by(() => prop + state);
</script>
