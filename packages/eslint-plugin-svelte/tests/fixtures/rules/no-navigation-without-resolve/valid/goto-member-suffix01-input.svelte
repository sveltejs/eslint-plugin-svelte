<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const paths = [resolve('/'), resolve('/about')];
	const routes = { home: resolve('/'), nested: { about: resolve('/about') } };
	const searchParams = new URLSearchParams();
	const query = searchParams.size ? '?' + searchParams : '';

	goto(paths[0] + '?query=param');
	goto(paths[1] + '#fragment');
	goto(paths[0] + '?' + searchParams);
	goto(paths[1] + query);
	goto(`${paths[0]}?query=param`);
	goto(`${paths[1]}${query}`);

	goto(routes.home + '?query=param');
	goto(routes['home'] + '#fragment');
	goto(routes.nested.about + query);
	goto(`${routes.nested.about}?${searchParams}#fragment`);

	goto([resolve('/')][0] + '?query=param');
</script>
