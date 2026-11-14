<script>
	import { goto } from '$app/navigation';

	const qs = '?q=1';

	goto(`/search${qs}`);
	goto('/search' + qs);
	goto(`/search${'?q=1'}`);
</script>
