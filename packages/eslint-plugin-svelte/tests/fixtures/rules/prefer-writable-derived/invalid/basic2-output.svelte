<script>
	const { albumName } = $props();

	let newAlbumName = $derived(albumName + albumName);
	;
</script>

<input bind:value={newAlbumName} />
