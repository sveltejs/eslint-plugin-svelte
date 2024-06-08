<script>
	const array = [1];
	const object = { b: 1 };
	$: a = array[0];
	$: b = object.b;
</script>

{a}{b}
<button on:click={() => (array[0] = 2)}>Foo</button>
<button on:click={() => (object.b = 2)}>Foo</button>
