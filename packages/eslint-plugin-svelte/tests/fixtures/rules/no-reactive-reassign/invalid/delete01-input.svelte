<script>
	let object = { value: 0 };
	$: reactiveValue = { value: object.value * 2 };

	function handleClick() {
		delete object.value;
		delete reactiveValue.value;
	}
</script>

{reactiveValue}
