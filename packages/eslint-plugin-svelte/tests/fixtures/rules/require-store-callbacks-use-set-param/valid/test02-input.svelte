<script>
	import { readable, writable, derived } from 'svelte/store';

	readable(null, function (set) {
		set(new Date());
		const interval = setInterval(() => set(new Date()), 1000);
		return () => clearInterval(interval);
	});

	readable(false, function (set) {
		/* do nothing */
	});

	writable(0, function (set) {
		return () => {};
	});
	writable(null, function (set) {
		set(0);
		return () => {};
	});

	derived(a, function ($a) {
		/* do nothing */
	});
	derived(
		a,
		function ($a, set) {
			setTimeout(() => set($a), 1000);
		},
		'one moment...'
	);
</script>
