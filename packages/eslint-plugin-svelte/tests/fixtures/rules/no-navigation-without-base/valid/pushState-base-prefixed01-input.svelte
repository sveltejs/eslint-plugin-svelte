<script>
	import { base } from '$app/paths';
	import { pushState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(base + '/foo/');
	pushState(`${base}/foo/`);
</script>
