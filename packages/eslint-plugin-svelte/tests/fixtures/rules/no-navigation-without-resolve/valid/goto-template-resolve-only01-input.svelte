<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const resolved = resolve('/foo');

	goto(`${resolve('/foo')}`);
	goto(`${resolved}`);
</script>
