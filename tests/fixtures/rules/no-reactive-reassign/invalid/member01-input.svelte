<script>
	let object = { value: 0 };
	$: reactiveValue = { value: object.value * 2, foo: { bar: object.value * 2 } };

	function handleClick() {
		reactiveValue.value = 42;
		// eslint-disable-next-line no-unsafe-optional-chaining -- ignore
		(reactiveValue?.foo).bar = 42;
	}
</script>

{reactiveValue}
