<script>
	import { writable } from 'svelte/store';
	let store = writable(() => 'hello');
	const constStore = writable(() => 'hello');
	$: foo = store();
	$: bar = constStore();
</script>
