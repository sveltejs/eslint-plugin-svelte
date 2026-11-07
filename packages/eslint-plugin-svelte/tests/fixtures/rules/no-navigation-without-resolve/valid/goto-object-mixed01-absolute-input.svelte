<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const item = { resolvedUrl: resolve('/'), absoluteUrl: 'https://example.com' };
	goto(item.absoluteUrl);
</script>
