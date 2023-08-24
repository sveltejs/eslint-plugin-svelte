<script>
	let value = 0;
	$: reactiveValue = value * 2;

	function handleClick() {
		let o = { 4: 42 };
		let a;
		({ [reactiveValue]: a } = o);
	}
</script>

{reactiveValue}
