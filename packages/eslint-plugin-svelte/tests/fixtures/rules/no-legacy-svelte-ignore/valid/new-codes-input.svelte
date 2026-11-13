<script>
	export let src;
</script>

<!-- svelte-ignore a11y_autofocus -->
<input autofocus />

<!-- svelte-ignore a11y_autofocus a11y_missing_attribute -->
<img {src} autofocus />

<!-- svelte-ignore a11y_autofocus (because of third-party code) -->
<input autofocus />

<div>
	<!-- svelte-ignore block_empty -->
	{#await Promise.resolve(src)}{/await}
</div>
