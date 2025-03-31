<script>
	const { albumName } = $props();

	let newAlbumName = $derived(albumName);
	;

	setInterval(() => {
		newAlbumName = albumName + albumName;
	}, 1000);
</script>

<input bind:value={newAlbumName} />
