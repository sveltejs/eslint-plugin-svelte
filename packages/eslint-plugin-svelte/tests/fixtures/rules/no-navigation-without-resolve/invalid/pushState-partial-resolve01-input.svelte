<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	pushState(resolve('/foo') + '/bar');
	pushState('/foo' + resolve('/bar'));
</script>
