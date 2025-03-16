<script>
	const { prop1, prop2 } = $props();
	const zero = $state(0);
	const derived = $derived(zero * 2);
	const derivedBy = $derived.by(calc());
</script>
