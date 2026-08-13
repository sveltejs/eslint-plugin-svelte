<script>
	const value = '../';
	const href = '../';
</script>

<a href="..">Click me!</a>
<a href="../">Click me!</a>
<a href="../other">Click me!</a>
<a href={'..' + '/other'}>Click me!</a>
<a href={value}>Click me!</a>
<a {href}>Click me!</a>
