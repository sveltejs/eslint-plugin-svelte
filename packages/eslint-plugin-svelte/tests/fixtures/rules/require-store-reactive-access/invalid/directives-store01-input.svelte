<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	let color = writable('red');
	let value = writable('hello');
	let handleClick = writable(() => {});
	const list = [];
</script>

<button on:click={handleClick} />
<div style:color={store} />
<div style:color />
<div use:store />
<div transition:store />
<div in:store />
<div out:store />
{#each list as e (e)}
	<div animate:store />
{/each}
<div class:name={constStore} />
<div class:constStore />

<!-- ignore -->
<div class:name={store} />
<div class:store />
