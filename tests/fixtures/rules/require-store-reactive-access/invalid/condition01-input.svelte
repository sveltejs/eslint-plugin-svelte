<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
	$: message = store ? `${store} world` : null;
	$: message2 = constStore ? `${constStore} world` : null;
</script>
