<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(base + '/foo/');
	goto(`${base}/foo/`);
</script>
