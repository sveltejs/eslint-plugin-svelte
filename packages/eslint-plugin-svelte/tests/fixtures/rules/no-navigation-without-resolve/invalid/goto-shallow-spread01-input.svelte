<script>
	import { goto } from '$app/navigation';

	const opts = { shallow: false };

	goto('', { shallow: true, ...opts });
	goto('', { shallow: true, shallow: false });
	goto('', opts);
</script>
