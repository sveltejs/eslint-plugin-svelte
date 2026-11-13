<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let store: Writable<number>;
	export let notStore: { update: (fn: () => void) => void };

	store.update((n) => n + 1);
	store.update((n) => {
		return n + 1;
	});
	notStore.update(() => {});
</script>
