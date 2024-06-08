<script>
	import { tick as tick2 } from 'svelte';
	let a = 0;

	function tick(fn) {
		fn();
	}

	$: {
		tick(() => {
			a = a + 1;
		});
	}

	$: {
		tick2(() => {
			a = a + 1;
		});
	}

	$: (async () => {
		await tick();
		a = a + 1;
	})();

	$: (async () => {
		await tick2();
		a = a + 1;
	})();
</script>
