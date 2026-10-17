<script>
	import { goto } from '$app/navigation';

	const value = '/foo';

	goto('/foo', { shallow: true });
	goto(value, { shallow: true });
	goto('/foo', { state: {}, shallow: true, replace: true });
</script>
