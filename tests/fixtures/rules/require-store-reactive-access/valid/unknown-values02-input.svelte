<script>
	import { writable } from 'svelte/store';

	let value;

	export let foo;
	$: {
		if (foo) {
			value = writable('hello');
		} else {
			value = null;
		}
	}
</script>

<!-- Unknown -->
<p>{value}</p>
