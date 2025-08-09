<script>
	import { resolve as alias } from '$app/paths';
	import { replaceState } from '$app/navigation';

	replaceState(alias('/foo/'));
</script>
