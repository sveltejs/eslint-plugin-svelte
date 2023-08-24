<script>
	let value = 0;
	$: reactiveValue = value * 2;
	$: reactiveObject = { value };
	$: reactiveArray = [value];

	function handleClick() {
		let o = { foo: 42 };
		({ foo: reactiveValue } = o);
		({ ...reactiveObject } = o);
		let a = [42];
		[reactiveValue] = a;
		[...reactiveArray] = a;
	}
</script>

{reactiveValue}
{JSON.stringify(reactiveObject)}
{JSON.stringify(reactiveArray)}
