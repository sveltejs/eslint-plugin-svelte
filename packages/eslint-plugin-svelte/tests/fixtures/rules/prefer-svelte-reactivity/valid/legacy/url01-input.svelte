<script>
	export let slug = '';
	const url = new URL('https://example.com');
	url.pathname = `/${slug}`;
</script>

<a href={url.toString()}>next</a>
