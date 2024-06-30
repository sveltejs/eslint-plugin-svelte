<script>
	let { prop } = $props();

	let state = $state();
	let frozen = $state.frozen();

	let derived = $derived(state + 1);
	let derivedBy = $derived.by(() => prop + state);
</script>
