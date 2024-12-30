<script>
	import { base } from '$app/paths';
	import { pushState } from '$app/navigation';

	pushState('/foo/' + base);
	pushState(`/foo/${base}`);
</script>
