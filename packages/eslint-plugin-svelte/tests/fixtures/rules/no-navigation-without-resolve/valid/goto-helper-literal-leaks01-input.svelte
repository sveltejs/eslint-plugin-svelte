<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { writable } from 'svelte/store';

	function withBase<T extends string>(p: T): T {
		return (base + p) as T;
	}
	function make<T extends string>(p: T) {
		return { href: (base + p) as T };
	}
	function touch(o: object) {
		return o;
	}

	class Nav {
		home = $state(withBase('/a'));
	}
	const nav = new Nav();
	goto(nav.home);

	const arr = [make('/a')];
	goto(arr[0].href);
	const link = { ...make('/a') };
	goto(link.href);

	const escaped = { home: withBase('/a') };
	touch(escaped);
	goto(escaped.home);

	const s = writable(withBase('/a'));
	goto($s);
</script>
