<script>
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(base + '/foo/');
	replaceState(`${base}/foo/`);
</script>
