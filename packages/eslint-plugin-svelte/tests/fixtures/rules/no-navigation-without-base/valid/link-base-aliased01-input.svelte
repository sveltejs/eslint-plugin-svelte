<script>
	import { base as alias } from '$app/paths';
</script>

<a href={alias + '/foo/'}>Click me!</a>;
<a href={`${alias}/foo/`}>Click me!</a>;
