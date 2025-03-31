<script>
	const { albumName } = $props();

	let newAlbumName = $derived(albumName);
	;
</script>

<FooComponent
	doSomething={(value) => {
		newAlbumName = value;
	}}
/>
