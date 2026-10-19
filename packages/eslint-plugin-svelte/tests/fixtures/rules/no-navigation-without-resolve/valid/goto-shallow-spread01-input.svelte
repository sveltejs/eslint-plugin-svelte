<script>
	import { goto } from '$app/navigation';

	const opts = { state: {} };

	goto('', { ...opts, shallow: true });
	goto('', { shallow: false, ...opts, shallow: true });
</script>
