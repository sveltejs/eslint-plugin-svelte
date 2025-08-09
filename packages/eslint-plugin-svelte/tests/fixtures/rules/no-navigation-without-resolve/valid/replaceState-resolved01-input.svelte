<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const value = resolve('/foo/');

	replaceState(resolve('/foo/'));
	replaceState(value);
</script>
