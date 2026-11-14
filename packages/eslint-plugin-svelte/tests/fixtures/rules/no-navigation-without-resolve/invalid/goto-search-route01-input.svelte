<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// `search` and `hash` are only special on URL objects.
	const routes = { search: '/search', hash: '/hash' };
	routes.search = resolve('/search');
	goto(routes.hash);

	const plain = '/plain';
	console.log(plain);
	goto(plain);
</script>
