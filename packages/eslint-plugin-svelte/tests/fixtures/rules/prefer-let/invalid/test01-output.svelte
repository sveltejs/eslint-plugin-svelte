<script>
	let { prop } = $props();
	let state = $state();
	let raw = $state.raw();
	let derived = $derived(state + 1);
	let derivedBy = $derived.by(() => prop + state);
</script>
