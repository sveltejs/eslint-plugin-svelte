<script>
	import { goto } from '$app/navigation';

	let unknown;
	const config = { opts: { shallow: false }, other: { state: {} } };

	goto('', config.opts);
	goto('', config.other);
	goto('', config.missing);
	goto('', unknown.opts);
</script>
