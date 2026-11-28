<script>
	export let value;

	// svelte-ignore export_let_unused -- not used yet
	export let unused;
</script>

<!-- svelte-ignore a11y_autofocus -->
<input autofocus bind:value />
