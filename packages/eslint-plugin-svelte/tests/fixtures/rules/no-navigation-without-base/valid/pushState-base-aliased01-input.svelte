<script>
	import { base as alias } from '$app/paths';
	import { pushState } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	pushState(alias + '/foo/');
	pushState(`${alias}/foo/`);
</script>
