<script>
	import { format } from './format.js';
	const { count } = $props();
	let doubled = $state(0);
	$effect(() => {
		doubled = count * 2;
	});
	function reset() {
		doubled = 0;
	}
</script>

<button onclick={reset}>{format(doubled)}</button>
