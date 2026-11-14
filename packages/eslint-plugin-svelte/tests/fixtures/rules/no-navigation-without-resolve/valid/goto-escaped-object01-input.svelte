<script>
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';

	const links = [{ href: '/a' }];
	for (const l of links) l.href = base + l.href;

	const o = { href: '/b' };
	const p = o;
	p.href = resolve('/b');
	goto(o.href);

	const q = { href: '/c' };
	fix(q);
	goto(q.href);

	const r = [{ href: '/d' }];
	r.forEach((item) => (item.href = resolve('/d')));
	goto(r[0].href);

	function fix(target) {
		target.href = resolve('/c');
	}
</script>

{#each links as link, i (i)}
	<a href={link.href}>Link</a>
{/each}
