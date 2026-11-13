<script>
	let { src } = $props();
</script>

<!-- svelte-ignore a11y-autofocus -->
<input autofocus />

<!-- svelte-ignore a11y-autofocus, a11y-missing-attribute -->
<img {src} autofocus />

<!-- svelte-ignore a11y-autofocus a11y-missing-attribute because of third-party code -->
<img {src} autofocus />
