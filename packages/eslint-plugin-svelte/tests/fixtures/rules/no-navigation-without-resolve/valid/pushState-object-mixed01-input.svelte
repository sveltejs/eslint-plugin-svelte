<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const item = { resolvedUrl: resolve('/'), emptyUrl: '' };
	pushState(item.resolvedUrl);
	pushState(item.emptyUrl);
</script>
