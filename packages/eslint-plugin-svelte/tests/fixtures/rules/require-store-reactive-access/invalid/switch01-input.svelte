<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	switch (store) {
		case 'hello':
			console.log('hello');
			break;
		default:
			console.log('other');
	}
	switch (constStore) {
		case 'hello':
			console.log('hello');
			break;
		default:
			console.log('other');
	}
</script>
