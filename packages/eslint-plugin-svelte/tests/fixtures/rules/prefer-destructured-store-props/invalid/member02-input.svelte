<script>
	import store from './store.js';
	$: ({ foo, bar: b } = $store);
	$: bbb = $store.baz;
</script>

foo.bar: {foo.bar}
foo.baz: {$store.foo.baz}

bar.foo: {b.foo}
bar.baz: {$store.bar.baz}

baz.foo: {bbb.foo}
baz.bar: {$store.baz.bar}
