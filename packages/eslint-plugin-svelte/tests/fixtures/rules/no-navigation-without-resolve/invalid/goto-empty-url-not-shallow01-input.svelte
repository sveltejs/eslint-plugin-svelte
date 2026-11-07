<script>
	import { goto } from '$app/navigation';

	goto('');
	goto('', {});
	goto('', { shallow: false });
	goto('', { state: {}, replace: true });
</script>
