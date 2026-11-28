<script>
	function createDerived(value, getValue) {
		const copy = value;
		let fromParam = $derived(value);
		let fromCopy = $derived(copy);
		let fromGetter = $derived(getValue());
		return { fromParam, fromCopy, fromGetter };
	}

	function handler() {}

	let fromFunctionDeclaration = $derived(handler);
</script>

{createDerived(1, () => 2)}{fromFunctionDeclaration}
