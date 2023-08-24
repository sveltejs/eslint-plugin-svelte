<script>
	let text = 'abc';
	const maxlength = 42;
	const attrs = { disabled: true };
	function click() {}
</script>

<input type="text" bind:value={text} {maxlength}
{...attrs} readonly />
<!-- prettier-ignore -->
<button type="button" on:click={click}
  {maxlength} {...attrs}>
  CLICK ME!
</button>
