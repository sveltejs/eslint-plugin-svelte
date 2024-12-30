<script>
	import * as paths from '$app/paths';
	import { replaceState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(paths.base + '/foo/');
	replaceState(`${paths.base}/foo/`);
</script>
