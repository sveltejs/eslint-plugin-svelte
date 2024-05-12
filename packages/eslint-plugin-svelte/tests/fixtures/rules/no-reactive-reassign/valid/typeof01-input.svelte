<script>
	let object = { value: 0 };
	$: reactiveValue = { value: object.value * 2 };

	function handleClick() {
		console.log(typeof reactiveValue.value);
	}
</script>

{reactiveValue}
