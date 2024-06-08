<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');

	async function foo() {
		return [await import($store), await import($constStore)];
	}
</script>
