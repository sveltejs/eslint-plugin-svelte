<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const routes = { home: resolve('/'), evil: '/evil' };
	const navItems = [{ url: resolve('/'), path: '/evil' }];

	goto(routes.home + routes.evil);
	goto(navItems[0].url + navItems[0].path);
</script>
