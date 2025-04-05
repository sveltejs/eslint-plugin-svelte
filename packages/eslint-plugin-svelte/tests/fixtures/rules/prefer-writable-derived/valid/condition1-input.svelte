<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);
	$effect(() => {
		if (albumName === '') {
			return;
		}
		newAlbumName = albumName;
	});
</script>

<input bind:value={newAlbumName} />
