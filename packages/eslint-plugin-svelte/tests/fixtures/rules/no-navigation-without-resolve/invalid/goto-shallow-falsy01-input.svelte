<script>
	import { goto } from '$app/navigation';

	let unknown;

	goto('', { shallow: 0 });
	goto('', { shallow: '' });
	goto('', { shallow: null });
	goto('', { shallow: undefined });
	goto('', { shallow: unknown });
</script>
