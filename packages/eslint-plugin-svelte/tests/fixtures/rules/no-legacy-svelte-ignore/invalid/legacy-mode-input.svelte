<script>
	export let src;

	function update() {
		// svelte-ignore non-top-level-reactive-declaration
		$: doubled = src;
	}
</script>

<!-- svelte-ignore a11y-autofocus -->
<input autofocus />

<!-- svelte-ignore a11y-autofocus a11y-missing-attribute -->
<img {src} autofocus />

<!-- svelte-ignore a11y_autofocus, a11y-missing-attribute -->
<img {src} autofocus />

<div>
	<!-- svelte-ignore empty-block -->
	{#await Promise.resolve(src)}{/await}
</div>

<button on:click={update}>Update</button>
