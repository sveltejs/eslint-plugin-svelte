<script>
	import * as paths from '$app/paths';
	import { pushState } from '$app/navigation';

	pushState(paths.resolve('/foo/'));
</script>
