import { writable } from 'svelte/store';

export function createCount() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update((n) => n + 1),
		decrement: () =>
			update((n) => {
				return n - 1;
			}),
		reset: () => set(0)
	};
}

export function other() {
	const update = (fn) => fn();
	update(() => {});
}
