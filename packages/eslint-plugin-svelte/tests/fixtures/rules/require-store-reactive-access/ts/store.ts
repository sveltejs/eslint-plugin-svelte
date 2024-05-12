import type { Subscriber, Unsubscriber, Writable } from 'svelte/store';
import { writable, readable, derived } from 'svelte/store';
export const wStore = writable(0);
export const rStore = readable(0);
export const dStore = derived(wStore, () => {
	//
});
export let unionStore: null | Writable<number>;
interface StoreLike extends Writable<number> {
	subscribe(
		run: Subscriber<number>,
		invalidate?: (value?: number) => void,
		additional?: string
	): Unsubscriber;
}
export let storeLike: StoreLike;
export const stores = {
	w: wStore,
	r: rStore,
	d: dStore
};
