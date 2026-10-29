<script>
	const keyValue = 'bar=baz';

	const value = '?foo=bar';
	const href = '?foo=bar';
</script>

<a href="?">Click me!</a>
<a href="?foo=bar">Click me!</a>
<a href={'?foo=bar'}>Click me!</a>
<a href={'?' + 'foo=bar'}>Click me!</a>
<a href={'#' + keyValue}>Click me!</a>
<a href={`#${keyValue}`}>Click me!</a>
<a href={value}>Click me!</a>
<a {href}>Click me!</a>
