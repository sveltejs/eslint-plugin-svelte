<script>
	let object = { value: 0 };
	$: reactiveValue = { value: object.value * 2 };

	function handleClick() {
		let a = {};
		(a ? reactiveValue : {}).value = 42;
		// OK
		(reactiveValue ? a : {}).value = 42;
	}
</script>

{reactiveValue}
