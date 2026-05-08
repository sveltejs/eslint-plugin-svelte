<script>
	const condition = true;
	const url = condition ? 'https://example.com' : '#section';
	const absUrl = 'https://example.com';
</script>

<a href={condition ? 'https://example.com' : '#section'}>Click me!</a>
<a href={condition ? '#section' : null}>Click me!</a>
<a href={condition ? 'https://example.com' : null}>Click me!</a>
<a href={url}>Click me!</a>
<a href={condition ? absUrl : '#section'}>Click me!</a>
