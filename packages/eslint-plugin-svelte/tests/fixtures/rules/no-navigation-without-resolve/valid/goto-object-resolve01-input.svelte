<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const navItem = { url: resolve('/') };
	goto(navItem.url);
</script>
