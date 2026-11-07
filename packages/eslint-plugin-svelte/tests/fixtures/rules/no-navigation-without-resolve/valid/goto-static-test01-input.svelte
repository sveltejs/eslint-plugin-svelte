<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const USE_RESOLVE = true;
	goto(USE_RESOLVE ? resolve('/a') : '/b');
</script>
