<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		routes,
		routes2,
		localize,
		HOME,
		PLAIN,
		type Route,
		type PlainRoute
	} from './_links';

	// From a function result: not trusted.
	goto(routes.about);
	const { about } = routes;
	goto(about);
	const local = $derived(localize({ about: '/about' } as const));
	goto(local.about);
	const key = 'about';
	goto(routes2[key]);
	let { href, home, plain }: { href: Route; home: typeof HOME; plain: PlainRoute } = $props();
	goto(href);
	goto(home);
	// Written out: trusted.
	goto(plain);
	goto(PLAIN.about);
</script>

<a href={routes.home}>Home</a>
