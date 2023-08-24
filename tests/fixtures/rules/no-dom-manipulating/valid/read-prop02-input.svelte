<script>
	let divElement;
	let foo = '';

	$: if (divElement) foo = `${divElement.data.foo}`;
</script>

<div bind:this={divElement} data-foo="Foo" />
