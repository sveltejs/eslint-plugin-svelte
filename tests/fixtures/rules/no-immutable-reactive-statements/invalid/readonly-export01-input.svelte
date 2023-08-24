<script>
	export const thisIs = 'readonly';

	export function greet(name) {
		console.log(`hello ${name}!`);
	}

	export class Foo {}

	const immutableVar = 'hello';

	$: message1 = greet(immutableVar);
	$: message2 = `this is${thisIs}`;
	$: instance = new Foo();
</script>
