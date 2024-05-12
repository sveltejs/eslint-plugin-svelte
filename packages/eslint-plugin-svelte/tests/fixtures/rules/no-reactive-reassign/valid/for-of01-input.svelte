<script>
	let rerender = 0;
	let value = 'a';
	$: reactiveValue = [value + value];
	let object = 2;

	function handleClick() {
		for (object of reactiveValue) {
			console.log(object);
		}
		rerender++;
	}
</script>

<button on:click={handleClick}>Click Me</button>

<input bind:value />

{reactiveValue[0] + rerender}
