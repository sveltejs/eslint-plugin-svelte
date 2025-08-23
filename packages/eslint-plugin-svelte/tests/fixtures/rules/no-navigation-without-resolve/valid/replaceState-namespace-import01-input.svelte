<script>
	import * as paths from '$app/paths';
	import { replaceState } from '$app/navigation';

	replaceState(paths.resolve('/foo/'));
</script>
