<script>
	import { resolve } from '$app/paths';

	const query = '?query=param';
</script>

<a href="{resolve('/')} ?query=param">Space before the query</a>
<a href="{resolve('/')} {query}">Space before the query</a>
<a href=" {resolve('/')}/evil ">Path suffix</a>
<a href=" /about ">Unresolved</a>
<a href="  ">Whitespace only</a>
