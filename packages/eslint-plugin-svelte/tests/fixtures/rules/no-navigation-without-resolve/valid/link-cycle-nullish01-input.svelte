<script>
	import { resolve } from '$app/paths';

	let o = $state({ link: { href: resolve('/a') } });
	function keep() {
		o = { ...o, link: o.link };
	}
</script>

<a href={o.link.href ?? '/home'}>Home</a>
