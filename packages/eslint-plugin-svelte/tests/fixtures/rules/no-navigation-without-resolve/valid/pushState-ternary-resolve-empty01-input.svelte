<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const condition = true;

	pushState(condition ? resolve('/foo') : '');
	pushState(condition ? '' : resolve('/foo'));
	pushState(condition ? '' : '');
	const url = condition ? resolve('/foo') : '';
	pushState(url);
	const resolved = resolve('/foo');
	pushState(condition ? resolved : '');
</script>
