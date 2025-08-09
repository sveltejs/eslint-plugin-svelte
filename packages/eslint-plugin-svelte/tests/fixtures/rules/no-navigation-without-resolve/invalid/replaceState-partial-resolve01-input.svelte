<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	replaceState(resolve('/foo') + '/bar');
	replaceState('/foo' + resolve('/bar'));
</script>
