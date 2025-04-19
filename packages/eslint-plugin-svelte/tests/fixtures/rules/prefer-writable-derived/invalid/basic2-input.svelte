<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);
	$effect(() => {
		newAlbumName = albumName + albumName;
	});
</script>

<input bind:value={newAlbumName} />
