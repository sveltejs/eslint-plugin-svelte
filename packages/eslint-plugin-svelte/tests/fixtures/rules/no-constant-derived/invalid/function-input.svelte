<script>
	let count = $state(0);
	let doubled = $derived(() => count * 2);
	let tripled = $derived(() => {
		return count * 3;
	});
	let quadrupled = $derived(function () {
		return count * 4;
	});
	let multiplied = $derived((factor) => count * factor);
	let loaded = $derived(async () => count);
</script>

{doubled()}{tripled()}{quadrupled()}{multiplied(5)}{loaded()}
