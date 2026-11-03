<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const item = { resolvedUrl: resolve('/'), absoluteUrl: 'https://example.com' };
	replaceState(item.resolvedUrl);
</script>
