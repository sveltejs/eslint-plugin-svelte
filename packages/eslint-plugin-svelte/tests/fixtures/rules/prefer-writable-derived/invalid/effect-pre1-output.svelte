<script>
	const { albumName } = $props();

	let newAlbumName = $derived(albumName);
	;
</script>

<input bind:value={newAlbumName} />
