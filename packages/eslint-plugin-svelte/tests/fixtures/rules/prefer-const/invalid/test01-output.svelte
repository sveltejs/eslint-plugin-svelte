<script>
	let { prop1, prop2 } = $props();
	const zero = 0;
	let state = $state(0);
	let frozen = $state.frozen(0);
	const doubled = state * 2;
	let derived = $derived(state * 2);
	const calculated = calc();
	let derivedBy = $derived.by(calc());
</script>
