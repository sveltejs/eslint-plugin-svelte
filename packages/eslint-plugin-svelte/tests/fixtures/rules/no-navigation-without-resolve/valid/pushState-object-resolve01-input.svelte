<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const navItem = { url: resolve('/') };
	pushState(navItem.url);
</script>
