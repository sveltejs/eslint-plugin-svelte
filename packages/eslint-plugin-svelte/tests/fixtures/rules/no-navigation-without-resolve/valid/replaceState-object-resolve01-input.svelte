<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const navItem = { url: resolve('/') };
	replaceState(navItem.url);
</script>
