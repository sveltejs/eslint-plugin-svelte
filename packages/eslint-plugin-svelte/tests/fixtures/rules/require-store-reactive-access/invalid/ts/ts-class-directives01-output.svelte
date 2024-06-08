<script lang="ts">
	import { writable, Writable } from 'svelte/store';
	let store: Writable<number> | null = null;
	const constStore = writable('hello');
</script>

<div style:color={$store} />
<div class:name={$constStore} />
<div class:constStore />

<!-- ignore -->
<div class:name={store} />
<div class:store />
