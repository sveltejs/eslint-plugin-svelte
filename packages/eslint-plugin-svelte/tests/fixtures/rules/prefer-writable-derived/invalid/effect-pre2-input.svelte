<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);
	$effect.pre(() => {
		newAlbumName = albumName + albumName;
	});
</script>

<input bind:value={newAlbumName} />
