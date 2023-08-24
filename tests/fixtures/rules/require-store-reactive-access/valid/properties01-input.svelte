<script lang="ts">
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');

	$: obj = {
		[$store]: store,
		[$constStore]: constStore,
		store,
		constStore
	};
	class Foo {
		store = store;

		[$store] = store;

		constStore = constStore;

		[$constStore] = constStore;
	}
	class Bar {
		[$store]() {
			return store;
		}

		store() {
			return store;
		}

		[$constStore]() {
			return constStore;
		}

		constStore() {
			return constStore;
		}
	}
</script>
