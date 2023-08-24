<script>
	import { store } from './store.js';

	$: setTimeout(() => {
		$store += 1;
	}, 100);
</script>
