<script module>
	import { resolve } from '$app/paths';

	export const home = resolve('/');
</script>

<script>
	import { goto } from '$app/navigation';

	goto('/instance');
</script>

<a href="/template">X</a>
