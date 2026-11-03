<svelte:options runes={false} />

<script>
	export let html;
</script>

<!-- svelte-ignore hydration-html-changed -->
{@html html}
