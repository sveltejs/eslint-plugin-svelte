<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const item = { resolvedUrl: resolve('/'), absoluteUrl: 'https://example.com' };
	pushState(item.resolvedUrl);
</script>
