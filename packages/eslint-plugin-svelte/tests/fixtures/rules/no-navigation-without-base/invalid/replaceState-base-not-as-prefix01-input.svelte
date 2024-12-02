<script>
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';

	replaceState('/foo/' + base);
	replaceState(`/foo/${base}`);
</script>
