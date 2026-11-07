<script>
	import { setContext } from 'svelte';
	import { format } from './format.js';
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	setContext('user', user);
</script>

<p>{format(user)}</p>
