<script>
	import { writable } from 'svelte/store';
	export let html;
	const state = writable(0);
</script>

<!-- svelte-ignore hydration-html-changed -->
{@html html}{$state}
