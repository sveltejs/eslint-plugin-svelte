<script>
	let { src } = $props();
</script>

<!-- svelte-ignore a11y_autofocus -->
<input autofocus />

<!-- svelte-ignore a11y_autofocus, a11y_missing_attribute -->
<img {src} autofocus />

<!-- svelte-ignore a11y_autofocus a11y-missing-attribute because of third-party code -->
<img {src} autofocus />
