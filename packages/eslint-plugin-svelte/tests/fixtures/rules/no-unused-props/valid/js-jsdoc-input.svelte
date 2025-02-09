<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} name - User name
	 * @property {number} age - User age
	 */
	const props = $props();
	// JSDoc is not checked, so no warning
	console.log(props.name);
</script>
