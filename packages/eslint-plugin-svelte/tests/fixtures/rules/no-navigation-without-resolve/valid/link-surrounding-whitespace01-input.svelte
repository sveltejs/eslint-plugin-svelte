<script>
	import { resolve } from '$app/paths';

	const query = '?query=param';
</script>

<a href="{resolve('/')} ">Trailing space</a>
<a href=" {resolve('/')}">Leading space</a>
<a href="  {resolve('/')}  ">Both</a>
<a
	href="
		{resolve('/')}
	">Newlines</a
>
<a href="{resolve('/')}{query} ">Query</a>
<a href=" {resolve('/')}?query=param ">Literal query</a>
<a href=" https://example.com ">Absolute</a>
<a href=" #fragment">Fragment</a>
