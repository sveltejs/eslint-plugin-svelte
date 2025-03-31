<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);

	// In practice, this can be converted to $derived, but it’s difficult to detect in all cases.
	// So the rule doesn’t report it for now.
	$effect(() => {
		if (albumName === '') {
			newAlbumName = albumName + albumName;
		} else {
			newAlbumName = albumName;
		}
	});
</script>

<input bind:value={newAlbumName} />
