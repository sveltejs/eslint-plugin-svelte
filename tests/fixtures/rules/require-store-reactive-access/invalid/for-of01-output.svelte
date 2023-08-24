<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	for (const c of $store) {
		console.log(c);
	}
	for (const c of $constStore) {
		console.log(c);
	}
</script>
