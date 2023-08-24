<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	for (const k in $store) {
		console.log(k);
	}
	for (const k in $constStore) {
		console.log(k);
	}
</script>
