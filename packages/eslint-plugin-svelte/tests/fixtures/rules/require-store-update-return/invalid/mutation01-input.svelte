<script>
	import { writable } from 'svelte/store';

	const items = writable([]);

	function add(item) {
		items.update(($items) => {
			$items.push(item);
		});
	}

	function clear() {
		items.update(($items) => {
			for (const item of $items) {
				if (item.locked) {
					return $items;
				}
			}
			$items.length = 0;
		});
	}
</script>

<button on:click={() => items.update(($items) => { $items.pop(); })}>pop</button>
