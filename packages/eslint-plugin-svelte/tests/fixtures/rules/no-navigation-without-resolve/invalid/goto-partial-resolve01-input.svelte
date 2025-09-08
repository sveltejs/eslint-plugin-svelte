<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	goto(resolve('/foo') + '/bar');
	goto('/foo' + resolve('/bar'));
</script>
