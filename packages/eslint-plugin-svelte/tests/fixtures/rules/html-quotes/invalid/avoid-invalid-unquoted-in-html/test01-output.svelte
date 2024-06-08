<script>
	let text = '';
	let value = '';
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';
</script>

<!-- prettier-ignore -->
<input type="text" bind:value={text} />
<input type="text" bind:value />
<!-- prettier-ignore -->
<input type="text" bind:value={value} />

<img {src} alt="{name} dances." />
<!-- prettier-ignore -->
<img src={src} alt="{name} dances." />
<!-- prettier-ignore -->
<img src={src} alt="{name} dances." />
<!-- prettier-ignore -->
<img src='{src === "foo" ? "a" : "b"}' alt="{name} dances." />
