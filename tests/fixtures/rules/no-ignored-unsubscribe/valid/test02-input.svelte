<script>
	import { writable } from 'svelte/store';

	const foo = writable(0);

	const unsubscribers = [];
	unsubscribers.push(
		foo.subscribe(() => {
			console.log('foo changed');
		})
	);
</script>
