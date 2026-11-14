import { writable } from 'svelte/store';

export function createCount() {
	const { subscribe, set, update } = writable(0);
	const { update: updateAlias } = writable(0);

	return {
		subscribe,
		increment: () =>
			update((n) => {
				n + 1;
			}),
		decrement: () =>
			updateAlias((n) => {
				n - 1;
			}),
		reset: () => set(0)
	};
}
