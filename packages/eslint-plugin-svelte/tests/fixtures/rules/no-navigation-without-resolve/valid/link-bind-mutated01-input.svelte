<script>
	import { resolve } from '$app/paths';

	let link = { href: '/a' };
</script>

<input bind:value={link.href} />
<a href={link.href}>A</a>
<a href={resolve('/b')}>B</a>
