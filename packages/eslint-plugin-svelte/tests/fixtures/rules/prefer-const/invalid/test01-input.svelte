<script>
	let { prop1, prop2 } = $props();
	let zero = 0;
	let state = $state(0);
	let raw = $state.raw(0);
	let doubled = state * 2;
	let derived = $derived(state * 2);
	let calculated = calc();
	let derivedBy = $derived.by(calc());
	let noInit;
</script>
