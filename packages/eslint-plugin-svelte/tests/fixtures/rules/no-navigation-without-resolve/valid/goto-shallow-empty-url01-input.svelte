<script>
	import { goto } from '$app/navigation';

	goto('', { shallow: true });
	goto(``, { shallow: true });
	goto('', { state: {}, shallow: true });
	goto('', { state: {}, shallow: true, replace: true });
</script>
