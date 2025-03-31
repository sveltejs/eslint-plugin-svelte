<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);
	$effect(() => {
		if (albumName === '') {
			newAlbumName = albumName + albumName;
		} else {
			newAlbumName = albumName;
		}
	});
</script>

<input bind:value={newAlbumName} />
