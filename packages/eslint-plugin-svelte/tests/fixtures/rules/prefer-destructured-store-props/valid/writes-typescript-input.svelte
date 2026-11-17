<svelte:options runes />
<script lang="ts">
	import { writable } from 'svelte/store';
	const store = writable({ foo: 1, nested: { value: 1 } });
</script>
<input bind:value={$store.foo!} />
<button onclick={() => {
	($store.foo as number)++;
	$store.foo! = 2;
	($store.nested as { value: number }).value = 2;
	($store.nested satisfies { value: number }).value++;
}}>Update</button>
