<script>
	import { goto } from '$app/navigation';

	const enabled = 1;

	goto('', { shallow: 1 });
	goto('', { shallow: 'yes' });
	goto('', { shallow: !0 });
	goto('', { shallow: enabled });
</script>
