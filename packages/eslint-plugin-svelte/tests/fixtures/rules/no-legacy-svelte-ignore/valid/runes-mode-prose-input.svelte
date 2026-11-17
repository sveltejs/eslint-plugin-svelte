<script>
	let { src } = $props();
</script>

<!-- svelte-ignore a11y_autofocus because of third-party code -->
<input autofocus />

<!-- svelte-ignore a11y_autofocus, a11y_missing_attribute -- see built-in docs -->
<img {src} autofocus />
