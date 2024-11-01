<script>
	import { base } from '$app/paths';
</script>

<a href={'/foo/' + base}>Click me!</a>
<a href={`/foo/${base}`}>Click me!</a>
