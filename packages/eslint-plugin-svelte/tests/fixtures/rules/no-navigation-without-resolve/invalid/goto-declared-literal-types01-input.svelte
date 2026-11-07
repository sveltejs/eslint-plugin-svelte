<script lang="ts">
	import { goto } from '$app/navigation';

	let { href }: { href: '/a' | '/b' } = $props();
	goto(href);

	type P = { u: '/c' };
	let p: P = { u: '/c' };
	console.info(p);
	goto(p.u);

	function f(x: '/d') {
		goto(x);
	}
	f('/d');
</script>
