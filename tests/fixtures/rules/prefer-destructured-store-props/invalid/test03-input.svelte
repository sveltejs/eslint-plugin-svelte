<script>
	import store from './store.js';

	let foo, bar;
	$: {
		foo = $store.foo;
		bar = $store.bar;
	}
</script>

<div>
	foo: {`${foo} ${Date.now()}`}
</div>
<div>
	bar: {`${bar} ${Date.now()}`}
</div>
<div>
	baz: {$store.baz}
</div>
