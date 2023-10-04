<script>
	import { writable } from 'svelte/store';

	const foo = writable(0);

	foo.subscribe(() => {
		console.log('foo changed');
	});
</script>
