<script>
	let object = 0;
	$: reactiveValue = value * 2;
	let foo;

	function handleClick() {
		foo = reactiveValue;
		console.log(foo);
		let bar = reactiveValue;
		console.log(bar);
	}
</script>

{reactiveValue}
