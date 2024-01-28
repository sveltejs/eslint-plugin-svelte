<script>
	import { base as alias } from '$app/paths';
	import { goto } from '$app/navigation';

	// eslint-disable-next-line prefer-template -- Testing both variants
	goto(alias + '/foo/');
	goto(`${alias}/foo/`);
</script>
