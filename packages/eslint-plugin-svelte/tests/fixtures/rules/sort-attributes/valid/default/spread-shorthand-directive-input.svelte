<script>
	let rest, components, visible, value, a, b, d, fn, action;
</script>

<div format="md" {...rest} {components} />
<div position="x" {...rest} bind:value />
<div id="x" {...rest} class:visible />
<div id="x" {...rest} {components} />
<div {...rest} {components} bind:value />
<div title="x" {...rest} style:color="red" />
<div use:action {...rest} on:click={fn} />
<div title="x" {...rest} {@attach fn} />
<div c {...a} b {...b} {d} />
