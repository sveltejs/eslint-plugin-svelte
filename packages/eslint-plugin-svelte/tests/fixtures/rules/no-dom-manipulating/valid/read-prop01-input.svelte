<script>
	let divElement;
	let height = '';

	$: if (divElement) height = `${divElement.clientHeight}px`;
</script>

<div bind:this={divElement} />
