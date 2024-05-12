<script>
	let object = { value: 0 };
	$: reactiveValue = { key: 'value', value: object.value * 2 };

	function handleClick() {
		object[reactiveValue.key] = 42;
	}
</script>

{reactiveValue}
