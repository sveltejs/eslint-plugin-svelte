<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const item = { resolvedUrl: resolve('/'), emptyUrl: '' };
	replaceState(item.resolvedUrl);
	replaceState(item.emptyUrl);
</script>
