<script>
	const protocol = 'https';
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
