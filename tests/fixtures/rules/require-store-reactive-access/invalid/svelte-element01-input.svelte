<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	let value = writable('hello');
	let div = writable('div');
	let input = writable('input');
</script>

<svelte:element this={div} prop="Hello {store}" />
<svelte:element this={div} prop={store} />
<svelte:element this={div} {store} />
<svelte:element this={div} {...store} />
<svelte:element this={div} bind:this={store} />
<svelte:element this={input} bind:value />
