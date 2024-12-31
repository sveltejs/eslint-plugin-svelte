<script>
	const a = $state();
	const b = $derived(a);
	const c = $derived.by(() => b);
</script>
