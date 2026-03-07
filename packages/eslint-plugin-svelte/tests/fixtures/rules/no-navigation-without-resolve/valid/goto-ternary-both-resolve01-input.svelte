<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const condition = true;
	const url = condition ? resolve('/foo') : resolve('/bar');
	const resolved = resolve('/foo');

	goto(condition ? resolve('/foo') : resolve('/bar'));
	goto(url);
	goto(condition ? resolved : resolve('/bar'));
</script>
