<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	// Paths that have no route (e.g. handled in a hook) can be cast on purpose.
	const annotated: ResolvedPathname = '/handled-in-hook';
</script>

<a href={'/handled-in-hook' as ResolvedPathname}>Click me!</a>
<a href={annotated}>Click me!</a>
