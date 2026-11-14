<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const paths = [resolve('/'), '/about'];
	const routes = { home: resolve('/'), about: '/about' };

	goto(paths[0] + '/evil');
	goto(`${paths[0]}/evil?query=param`);
	goto(paths[1] + '?query=param');
	goto(routes.home + '/evil');
	goto(routes.about + '#fragment');
</script>
