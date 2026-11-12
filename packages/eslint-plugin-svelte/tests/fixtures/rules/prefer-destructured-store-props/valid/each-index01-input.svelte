<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	const items = [];
	const g = (v) => v;
</script>

{#each items as i}{$s[i]}{/each}
{#each items as i}{$s[i].a}{/each}
{#each items as item}{$s[item.id]}{/each}
{#each items as i}{$s[g({ i })]}{/each}
{#each items as i}{$s[g({ [i]: 1 })]}{/each}
{#each items as i, idx}{$s[idx]}{/each}
