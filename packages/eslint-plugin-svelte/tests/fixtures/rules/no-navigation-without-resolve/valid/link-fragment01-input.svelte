<script>
	const section = 'sectionName';

	const value = '#section';
	const href = '#section';
</script>

<a href="#">Click me!</a>
<a href="#section">Click me!</a>
<a href={'#section'}>Click me!</a>
<a href={'#' + 'section'}>Click me!</a>
<a href={'#' + section}>Click me!</a>
<a href={`#${section}`}>Click me!</a>
<a href={'#user:42'}>Click me!</a>
<a href={value}>Click me!</a>
<a {href}>Click me!</a>
