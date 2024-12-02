<script>
	import * as paths from '$app/paths';
	import { goto } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(paths.base + '/foo/');
	goto(`${paths.base}/foo/`);
</script>
