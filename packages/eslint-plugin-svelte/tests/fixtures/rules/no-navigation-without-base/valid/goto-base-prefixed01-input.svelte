<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	const value1 = base + '/foo/';
	const value2 = `${base}/foo/`;

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(base + '/foo/');
	goto(`${base}/foo/`);
	goto(value1);
	goto(value2);
</script>
