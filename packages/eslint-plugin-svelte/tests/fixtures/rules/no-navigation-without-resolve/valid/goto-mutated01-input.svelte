<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const link = { href: '/a' };
	link.href = resolve('/a');
	goto(link.href);

	const links = ['/b'];
	links[0] = resolve('/b');
	goto(links[0]);

	const list = ['/c'];
	list.splice(0, 1, resolve('/c'));
	goto(list[0]);

	const target = { href: '/d' };
	Object.assign(target, { href: resolve('/d') });
	goto(target.href);

	// eslint-disable-next-line no-var
	var h = '/e';
	// eslint-disable-next-line no-var, no-redeclare
	var h = resolve('/e');
	goto(h);

	const link2 = { href: '/f' };
	({ href: link2.href } = { href: resolve('/f') });
	goto(link2.href);

	const link3 = { href: '/g' };
	for (link3.href of [resolve('/g')]);
	goto(link3.href);
</script>
