<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');

	async function foo() {
		return [await store, await constStore];
	}
</script>
