<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const value = resolve('/foo/');

	pushState(resolve('/foo/'));
	pushState(value);
</script>
