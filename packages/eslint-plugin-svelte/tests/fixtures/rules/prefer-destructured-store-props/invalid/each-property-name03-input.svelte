<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	const items = [];
	$: a = $s.a;
</script>

{a}
{#each items as a}{$s.a}{/each}
