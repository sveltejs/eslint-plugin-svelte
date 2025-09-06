<script>
	const protocol = 'https';

	const value = "https://svelte.dev";
</script>

<a href="http://svelte.dev">Click me!</a>
<a href="https://svelte.dev">Click me!</a>
<a href={'http://svelte.dev'}>Click me!</a>
<a href={'https://svelte.dev'}>Click me!</a>
<a href={'http://svelte' + '.dev'}>Click me!</a>
<a href={'https://svelte' + '.dev'}>Click me!</a>
<a href={'http' + '://svelte.dev'}>Click me!</a>
<a href={'https' + '://svelte.dev'}>Click me!</a>
<a href={`${protocol}://svelte.dev`}>Click me!</a>
<a href="mailto:user@example.com">Click me!</a>
<a href="tel:+123456789">Click me!</a>
<a href={value}>Click me!</a>
