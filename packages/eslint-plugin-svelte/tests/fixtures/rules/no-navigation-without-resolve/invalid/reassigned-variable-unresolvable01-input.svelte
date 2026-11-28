<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let loggedIn = $state(false);

	let oneUnresolved = resolve('/');
	if (loggedIn) oneUnresolved = resolve('/dashboard');
	else oneUnresolved = '/login';
	goto(oneUnresolved);

	let noInit;
	if (loggedIn) noInit = resolve('/');
	goto(noInit);

	let compound = resolve('/');
	compound += '?q=svelte';
	goto(compound);

	let destructured = resolve('/');
	[destructured] = [resolve('/dashboard')];
	goto(destructured);

	let looped = resolve('/');
	for (looped of [resolve('/a'), resolve('/b')]) {
		goto(looped);
	}

	let selfReferencing = resolve('/');
	selfReferencing = selfReferencing + '/suffix';
	goto(selfReferencing);

	let bound = resolve('/');
</script>

<input bind:value={bound} />
<a href={bound}>Link</a>
