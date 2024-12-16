<script>
	import { base as alias } from '$app/paths';
	import { replaceState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	replaceState(alias + '/foo/');
	replaceState(`${alias}/foo/`);
</script>
