<script>
	import { writable } from 'svelte/store';
	const loading = writable(false);
	const saving = writable(false);
	const busy = $loading || saving;
	const busy2 = $loading ?? saving;
</script>

{#if $loading || saving}
	<p>busy</p>
{/if}
