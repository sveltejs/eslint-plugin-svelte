<script>
	import { writable } from 'svelte/store';

	const store = writable(false);
	let foo, bar;

	store.update(($store) => {
		// ...
	});

	store.update(($store) => {
		if (foo) {
			return bar;
		}
	});

	store.update(function ($store) {
		$store = !$store;
	});

	store.update(($store) => {
		if (foo) {
			return;
		}
		return bar;
	});

	store['update'](($store) => {});
	store?.update(($store) => {});
</script>
