<script>
	import { resolve } from '$app/paths';
</script>

<!-- `resolve('/about/')` is a type error with the default `trailingSlash`, so no suggestion. -->
<a href="/about/">Click me!</a>
<a href="/about/?tab=1">Click me!</a>
<a href="/">Click me!</a>
