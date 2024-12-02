<script>
	import { base } from '$app/paths';
	import { pushState } from '$app/navigation';

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(base + '/foo/');
	pushState(`${base}/foo/`);
	pushState(value1);
	pushState(value2);
</script>
