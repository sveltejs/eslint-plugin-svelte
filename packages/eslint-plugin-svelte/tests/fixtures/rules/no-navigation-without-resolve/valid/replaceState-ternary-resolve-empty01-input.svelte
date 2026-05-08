<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const condition = true;

	replaceState(condition ? resolve('/foo') : '');
	replaceState(condition ? '' : resolve('/foo'));
	replaceState(condition ? '' : '');
	const url = condition ? resolve('/foo') : '';
	replaceState(url);
	const resolved = resolve('/foo');
	replaceState(condition ? resolved : '');
</script>
