<script>
	const value = 'whatever';
	const href = 'whatever';
	const external = 'external';
	const rel = 'external';
</script>

<a href="whatever" rel="external">Click me!</a>
<a href={'whatever'} rel="external">Click me!</a>
<a href={value} rel="external">Click me!</a>
<a {href} rel="external">Click me!</a>
<a href="whatever" rel={'external'}>Click me!</a>
<a href="whatever" rel={external}>Click me!</a>
<a href="whatever" {rel}>Click me!</a>
<a href="whatever" rel="noopener external noreferrer">Click me!</a>
