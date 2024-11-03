<script>
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(base + '/foo/');
	replaceState(`${base}/foo/`);
	replaceState(value1);
	replaceState(value2);
</script>
