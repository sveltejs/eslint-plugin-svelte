<script>
	export let src;

	function update() {
		// svelte-ignore reactive_declaration_invalid_placement
		$: doubled = src;
	}
</script>

<!-- svelte-ignore a11y_autofocus -->
<input autofocus />

<!-- svelte-ignore a11y_autofocus a11y_missing_attribute -->
<img {src} autofocus />

<!-- svelte-ignore a11y_autofocus, a11y_missing_attribute -->
<img {src} autofocus />

<div>
	<!-- svelte-ignore block_empty -->
	{#await Promise.resolve(src)}{/await}
</div>

<button on:click={update}>Update</button>
