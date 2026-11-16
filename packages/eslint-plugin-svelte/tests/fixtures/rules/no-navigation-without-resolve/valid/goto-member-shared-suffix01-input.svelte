<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const routes = { home: resolve('/'), query: '?query=param', fragment: '#fragment' };
	const parts = [resolve('/about'), '?query=param'];

	goto(routes.home + routes.query);
	goto(routes.home + routes.query + routes.fragment);
	goto(`${routes.home}${routes.fragment}`);
	goto(parts[0] + parts[1]);
</script>
