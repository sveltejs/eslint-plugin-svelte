<script>
	import store from './store.js';

	$: foo = $store.foo;
	$: ({ bar } = $store);
</script>
