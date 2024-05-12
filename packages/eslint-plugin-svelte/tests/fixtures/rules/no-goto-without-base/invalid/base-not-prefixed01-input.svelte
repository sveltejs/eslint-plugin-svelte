<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	goto('/foo/' + base);
	goto(`/foo/${base}`);
</script>
