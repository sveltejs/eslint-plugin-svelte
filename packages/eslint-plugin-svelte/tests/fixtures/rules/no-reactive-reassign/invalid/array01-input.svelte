<script>
	let rerender = 0;
	let value = 'abc123';
	$: array1 = [...value];
	$: array2 = [...value];
	$: array3 = [...value];
	$: array4 = [...value];
	$: array5 = [...value];
	$: array6 = [...value];
	$: array7 = [...value];
	$: array8 = [...value];
	$: array9 = [...value];

	function handleClick() {
		array1.push(42);
		array2.pop();
		array3.shift();
		array4.unshift(42);
		array5.reverse();
		array6.splice(1, 1);
		array7.sort();
		array8.copyWithin(0, 3, 4);
		array9.fill(42);
		rerender++;
	}
</script>

<button on:click={handleClick}>Click Me</button>

<input bind:value />

{JSON.stringify(array1) +
	JSON.stringify(array2) +
	JSON.stringify(array3) +
	JSON.stringify(array4) +
	JSON.stringify(array5) +
	JSON.stringify(array6) +
	JSON.stringify(array7) +
	JSON.stringify(array8) +
	JSON.stringify(array9) +
	rerender}
