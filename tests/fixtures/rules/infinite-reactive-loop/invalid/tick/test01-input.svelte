<script>
	import { tick } from 'svelte';
	const tick2 = tick;
	let a = 0;

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
