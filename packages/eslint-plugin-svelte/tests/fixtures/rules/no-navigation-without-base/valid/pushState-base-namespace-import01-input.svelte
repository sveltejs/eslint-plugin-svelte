<script>
	import * as paths from '$app/paths';
	import { pushState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(paths.base + '/foo/');
	pushState(`${paths.base}/foo/`);
</script>
