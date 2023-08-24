<script lang="ts">
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');

	$: obj = {
		[$store]: store,
		[$constStore]: constStore
	};
	class Foo {
		[$store] = store;

		[$constStore] = constStore;

		[$store]() {
			return store;
		}

		[$constStore]() {
			return constStore;
		}
	}
</script>
