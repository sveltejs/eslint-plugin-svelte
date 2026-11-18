<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	const items = [];
	const g = (v) => v;
</script>

{#each items as a}{$s.a}{/each}
{#each items as a}{$s.b.a}{/each}
{#each items as a}{$s[g({ a: 1 })]}{/each}
{#each items as a}{$s?.a}{/each}
{#each items as i}{$s.a[i]}{/each}
