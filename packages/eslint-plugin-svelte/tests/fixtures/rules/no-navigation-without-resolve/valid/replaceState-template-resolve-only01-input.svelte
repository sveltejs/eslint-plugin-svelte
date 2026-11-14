<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const resolved = resolve('/foo');

	replaceState(`${resolve('/foo')}`);
	replaceState(`${resolved}`);
</script>
