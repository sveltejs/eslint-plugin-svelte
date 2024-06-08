<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	let value = writable('hello');
</script>

<div prop="Hello {$store}" />
<div prop={$store} />
<div {store} />
<div {...$store} />
<div bind:this={$store} />
<input bind:value />
