<script>
	import { base, resolve } from '$app/paths';

	let { other, flag } = $props();
	const routes = { about: { href: '/about' } };
	Object.values(routes).forEach((r) => {
		r.href = base + r.href;
	});
	const nav = [{ id: 1, href: '/home' }];
	nav.map((n) => {
		n.href = base + n.href;
	});
	const nav2 = [{ id: 1, href: '/home' }];
	nav2.find((n) => n.id === 1).href = resolve('/home');
	const nav3 = [{ href: '/home' }];
	const first = nav3[0];
	first.href = resolve('/home');
	const cfg = { link: { href: '/home' }, list: [{ href: '/home' }] };
	const { link } = cfg;
	link.href = resolve('/home');
	for (const n of cfg.list) n.href = resolve('/home');
	const cfg2 = { link: { href: '/home' } };
	fix(cfg2.link);
	function fix(l) {
		l.href = resolve('/home');
	}
	const nav4 = [{ href: '/home' }];
	function getNav() {
		return nav4;
	}
	getNav()[0].href = resolve('/home');
	const link2 = { href: '/home' };
	const t = other ?? link2;
	t.href = resolve('/home');
	const a = { href: '/a' };
	const b = { href: '/b' };
	(flag ? a : b).href = resolve('/');
	let nav5;
	nav5 = [{ href: '/home' }];
	for (const n of nav5) n.href = resolve('/home');
</script>

<a href={routes.about.href}>A</a>
<a href={nav[0].href}>A</a>
<a href={nav2[0].href}>A</a>
<a href={nav3[0].href}>A</a>
<a href={cfg.link.href}>A</a>
<a href={cfg.list[0].href}>A</a>
<a href={cfg2.link.href}>A</a>
<a href={nav4[0].href}>A</a>
<a href={link2.href}>A</a>
<a href={a.href}>A</a>
<a href={nav5[0].href}>A</a>
