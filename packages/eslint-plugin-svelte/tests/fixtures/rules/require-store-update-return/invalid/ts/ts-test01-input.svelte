<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let store: Writable<number>;
	export let stores: { count: Writable<number> };

	store.update((n) => {
		n++;
	});

	stores.count.update((n) => {
		n++;
	});
</script>
