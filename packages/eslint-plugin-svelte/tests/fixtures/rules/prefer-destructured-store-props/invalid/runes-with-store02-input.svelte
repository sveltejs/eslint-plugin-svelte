<svelte:options runes />

<script>
	import { writable } from 'svelte/store';
	const foo = writable({ bar: 1 });
	const bar = 1;
</script>

{$foo.bar}{bar}
