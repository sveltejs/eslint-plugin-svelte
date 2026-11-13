<script>
	import { writable, readable } from 'svelte/store';

	const store = writable(false);
	let foo, bar;

	store.update(($store) => true);

	store.update(($store) => {
		return true;
	});

	store.update(($store) => {
		if (foo) {
			// ...
			return bar;
		}

		return true;
	});

	store.update(($store) => {
		if (foo) {
			return bar;
		} else {
			return !bar;
		}
	});

	store.update(($store) => {
		switch ($store) {
			case true:
				return false;
			default:
				return true;
		}
	});

	store.update(($store) => {
		throw new Error('error');
	});

	store.update(($store) => {
		while (true) {
			if (foo) {
				return bar;
			}
		}
	});

	store.update(($store) => {
		[1, 2].forEach((n) => {
			foo = n;
		});
		return $store;
	});

	store.update(($store) => {
		function reset() {
			foo = null;
			return;
		}
		reset();
		return $store;
	});

	store.update(($store) => void foo);

	store.update(updater);
	function updater($store) {}

	// Not the updater
	store.update(($store) => true, () => {});
	store.set(true);
	store.subscribe(($store) => {
		foo = $store;
	});

	// Not a store
	const notStore = { update: (fn) => fn() };
	notStore.update(() => {});
	update(() => {});
	function update(fn) {}

	// async and generator functions are not checked
	store.update(async ($store) => {});
	store.update(function* ($store) {});

	const r = readable(false, (set) => {
		set(true);
	});
</script>

<button on:click={() => store.update(($store) => !$store)}>toggle</button>
<button on:click={() => store.set(false)}>reset</button>
