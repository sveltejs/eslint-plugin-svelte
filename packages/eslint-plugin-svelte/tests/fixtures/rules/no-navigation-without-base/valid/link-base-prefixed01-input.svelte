<script>
	import { base } from '$app/paths';

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;
</script>

<a href={base + '/foo/'}>Click me!</a>
<a href={`${base}/foo/`}>Click me!</a>
<a href={value1}>Click me!</a>
<a href={value2}>Click me!</a>
