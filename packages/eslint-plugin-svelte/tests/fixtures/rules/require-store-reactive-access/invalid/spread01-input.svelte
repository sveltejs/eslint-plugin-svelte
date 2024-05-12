<script>
	import { writable } from 'svelte/store';
	let store = writable([42]);
	const constStore = writable(['hello']);

	console.log(...store);
	console.log(...constStore);
</script>
