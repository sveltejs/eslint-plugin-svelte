<script>
	const { albumName } = $props();

	let newAlbumName = $state(albumName);
	$effect(() => {
		newAlbumName = albumName;
	});

	setInterval(() => {
		newAlbumName = albumName + albumName;
	}, 1000);
</script>

<input bind:value={newAlbumName} />
