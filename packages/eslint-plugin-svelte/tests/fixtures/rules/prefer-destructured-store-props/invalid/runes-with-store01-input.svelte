<script>
	import store from './store.js';
	let count = $state(0);
	let doubled = $derived.by(() => count * 2);
</script>

<!-- $state and $derived.by should be ignored (runes), but $store.foo should be reported -->
<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Store value: {$store.foo}</p>
