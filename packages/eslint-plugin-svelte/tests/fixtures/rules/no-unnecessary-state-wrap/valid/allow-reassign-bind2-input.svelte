<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Bug3 from './Bug3.svelte';

	let svelteSet = $state(new SvelteSet<number>([]));
</script>

<Bug3 bind:svelteSet={() => svelteSet, (v) => (svelteSet = v)} />
