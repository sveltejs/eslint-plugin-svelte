<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let { prefix } = $props();

	// `prefix` may be empty even when the app has a base path.
	goto((prefix && base) || '/home');
	goto(base || prefix || '/home');
</script>
