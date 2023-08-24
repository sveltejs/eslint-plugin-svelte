<script>
	import { writable } from 'svelte/store';
	let store = writable((...args) => args.join(','));
	const constStore = writable((...args) => args.join(','));

	console.log(store`abc`);
	console.log(constStore`abc`);
</script>
