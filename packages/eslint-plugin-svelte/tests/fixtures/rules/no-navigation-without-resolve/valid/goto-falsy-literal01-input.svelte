<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const count = 0;
	let x = $state('');
	goto(count || resolve('/'));
	goto(false || resolve('/'));
	goto(null ?? resolve('/'));
	goto(1 && resolve('/'));
	// The fallback is never used: a template literal is never nullish.
	goto(`${x}` ?? '/never');
	goto(resolve('/') ?? '/never');
</script>
