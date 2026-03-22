<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const condition = true;

	goto(condition ? resolve('/foo') : '');
	goto(condition ? '' : resolve('/foo'));
	goto(condition ? '' : '');
</script>
