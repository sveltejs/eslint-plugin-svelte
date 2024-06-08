<script>
	let rerender = 0;
	let value = 'a';
	$: reactiveValue = { key: value + value };
	let object = { key: 42 };

	function handleClick() {
		for (object.key in reactiveValue) {
			console.log(reactiveValue.key);
		}
		rerender++;
	}
</script>

<button on:click={handleClick}>Click Me</button>

<input bind:value />

{reactiveValue.key + rerender}
