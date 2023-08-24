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
	{def}
	bind:value={componentValue}
	on:changeValue={handleChange}
	data-foo
	{abc}
	bind:metaData
	--style-props={color}
/>
<input
	bind:this={foo}
	id="foo"
	style:color
	style="width: 150px;"
	class="my-input"
	class:disable
	class:enable={!disable}
	bind:value={inputValue}
	use:action
	animate:name
	transition:fn
	in:fn
	out:fn
/>
<slot name="content" {abc} data-foo {def} />
