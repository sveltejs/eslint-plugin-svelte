<script>
	import { store } from './store.js';

	const doSomething = () => {
		$store += 1;
	};

	$: (async () => {
		await doSomething();
	})();
</script>
