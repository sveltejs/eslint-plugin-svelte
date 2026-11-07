<script>
	import { goto } from '$app/navigation';

	let { x, u } = $props();
	const links = { home: '/home' };
	const h = links.home;
	goto(h);
	const nav = [{ href: '/nav' }];
	const { href } = nav[0];
	console.log(nav);
	if (nav.includes(x)) goto(nav[0].href);
</script>

{#each nav as n, i (i)}
	<a href={n.href}>Nav</a>
{/each}
<a {href}>Nav</a>
<a href={u && '/login'}>Login</a>
