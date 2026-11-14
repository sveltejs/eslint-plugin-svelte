<script>
	import { goto } from '$app/navigation';
	import { base, assets } from '$app/paths';

	// The right side is used only when the base path is empty.
	let { from } = $props();
	let previousPage = $state(base || '/');
	previousPage = from || previousPage || base || '/';
	goto(previousPage);
	goto(base || '/home');
	goto(assets || '/');
	goto(`${base}` || '/home');
	goto(base || '/fallback');
</script>

<a href={base || '/'}>Home</a>
