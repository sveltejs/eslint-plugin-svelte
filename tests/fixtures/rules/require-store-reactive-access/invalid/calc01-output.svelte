<script>
	import { writable } from 'svelte/store';
	let store = writable(42);
	const constStore = writable('hello');

	// UpdateExpression
	console.log($store++);
	console.log($store--);
	console.log(++$store);
	console.log(--$store);

	// UnaryExpression
	console.log(-$store);
	// eslint-disable-next-line no-implicit-coercion -- test
	console.log(+$store);
	console.log(!store);
	console.log(~$store);
	console.log(typeof store);
	console.log(!$constStore);
	console.log(typeof $constStore);

	let foo = 1;
	// AssignmentExpression
	store = writable(42);
	$store += 42;
	foo += $store;
	foo = store;

	// BinaryExpression
	console.log($store + 42);
	console.log(42 + $store);
	console.log(store == null);
	console.log(store != null);
	console.log(store === null);
	console.log(store !== null);
	console.log($constStore == null);
	console.log($constStore != null);
	console.log($constStore === null);
	console.log($constStore !== null);

	// LogicalExpression
	console.log(store && foo);
	console.log($constStore || foo);
</script>
