<script>
	import { count } from './store.js';
	let a = 0;
	const doSomething = async () => {
		await fetchFromServer();
		a += 1;
		$count += 1;
	};

	const doSomething2 = () => {
		a += 1;
		$count += 1;
	};

	$: (async () => {
		console.log(a);
		await doSomething();
		doSomething2();
	})();

	$: (async () => {
		// should not report here
		await doSomething();
		doSomething2();
	})();
</script>
