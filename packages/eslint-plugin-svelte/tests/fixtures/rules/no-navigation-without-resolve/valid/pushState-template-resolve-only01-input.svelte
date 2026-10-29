<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const resolved = resolve('/foo');

	pushState(`${resolve('/foo')}`);
	pushState(`${resolved}`);
</script>
