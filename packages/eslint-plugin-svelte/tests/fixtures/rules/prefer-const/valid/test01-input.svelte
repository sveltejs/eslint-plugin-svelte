<script>
	let { prop1, prop2 } = $props();
	const zero = $state(0);
	let derived = $derived(zero * 2);
	let derivedBy = $derived.by(calc());
</script>
