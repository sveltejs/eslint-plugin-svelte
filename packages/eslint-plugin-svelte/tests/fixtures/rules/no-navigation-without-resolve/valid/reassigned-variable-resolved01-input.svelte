<script>
	import { goto, pushState } from '$app/navigation';
	import { resolve } from '$app/paths';

	let loggedIn = $state(false);

	let url = resolve('/');
	if (loggedIn) url = resolve('/dashboard');
	goto(url);
	pushState(url, {});

	let target = resolve('/');
	function login() {
		target = loggedIn ? resolve('/dashboard') : resolve('/login');
	}
	login();
	goto(target);

	let withQuery = resolve('/');
	withQuery = resolve('/search') + '?q=svelte';
	goto(withQuery);

	let paths = [resolve('/')];
	if (loggedIn) paths = [resolve('/dashboard')];
</script>

<a href={url}>Link</a>
<a href={paths[0]}>Link</a>
