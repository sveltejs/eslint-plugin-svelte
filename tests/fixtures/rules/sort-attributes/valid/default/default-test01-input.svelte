<script>
	import component from './foo';
	let style = { color: 'red' };
	let componentValue;
	let metaData = {};
	let foo;
	let color = 'red';
	let disable = false;
	let inputValue;
	let abc, def;
	function fn() {}
	function handleChange() {}
	function action() {}
</script>

<svelte:component
	this={component}
	--style-props={color}
	{abc}
	data-foo
	{def}
	bind:value={componentValue}
	on:changeValue={handleChange}
	bind:metaData
/>
<input
	bind:this={foo}
	id="foo"
	style="width: 150px;"
	style:color
	class="my-input"
	class:disable
	class:enable={!disable}
	bind:value={inputValue}
	use:action
	transition:fn
	in:fn
	out:fn
	animate:name
/>
<slot name="content" {abc} {def} />
