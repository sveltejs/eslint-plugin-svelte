<script>
	const section = 'sectionName';
</script>

<a href="#">Click me!</a>
<a href="#section">Click me!</a>
<a href={'#section'}>Click me!</a>
<a href={'#' + 'section'}>Click me!</a>
<a href={'#' + section}>Click me!</a>
<a href={`#${section}`}>Click me!</a>
