<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	if (store) {
		console.log(store);
	}
	if ($constStore) {
		console.log(constStore);
	}
</script>
