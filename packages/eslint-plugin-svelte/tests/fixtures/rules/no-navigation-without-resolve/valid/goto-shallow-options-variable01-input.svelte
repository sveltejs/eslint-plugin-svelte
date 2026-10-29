<script>
	import { goto } from '$app/navigation';

	const opts = { state: {}, shallow: true };
	const replaceOpts = { ...opts, replace: true };
	const aliased = opts;
	const noShallowKey = { state: {} };
	const notOverridden = { shallow: true, ...noShallowKey };

	goto('', opts);
	goto('', replaceOpts);
	goto('', aliased);
	goto('', notOverridden);
</script>
