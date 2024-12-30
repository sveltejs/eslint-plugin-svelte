<script>
	import { goto } from '$app/navigation';

	const value = "/foo";

	goto('/foo');
	goto(value);
</script>
