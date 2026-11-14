<script>
	import { goto } from '$app/navigation';

	const config = { opts: { shallow: true }, nested: { opts: { state: {}, shallow: true } } };

	goto('', config.opts);
	goto('', config['opts']);
	goto('', config.nested.opts);
</script>
