<script>
	import { goto } from '$app/navigation';

	goto('/login?redirect=https://example.com/x');
	goto('/a//b');
	goto('/(app)/settings');
</script>
