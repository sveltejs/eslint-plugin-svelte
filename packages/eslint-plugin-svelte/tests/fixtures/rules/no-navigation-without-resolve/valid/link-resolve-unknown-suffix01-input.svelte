<script lang="ts">
	import { resolve } from '$app/paths';

	const { query }: { query: string } = $props();
</script>

<!-- What follows resolve() is unknown: not reported by default (see `strict`). -->
<a href={resolve('/search') + query}>Click me!</a>
<a href={`${resolve('/search')}${query}`}>Click me!</a>
<a href="{resolve('/search')}{query}">Click me!</a>
