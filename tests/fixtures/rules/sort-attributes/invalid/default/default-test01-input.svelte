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

<!-- prettier-ignore -->
<svelte:component
  bind:value={componentValue}
  this={component}
  on:changeValue={handleChange}
  {def}
  data-foo
  {abc}
  bind:metaData
  --style-props={color}
/>
<input
	id="foo"
	bind:this={foo}
	style:color
	style="width: 150px;"
	class="my-input"
	class:enable={!disable}
	class:disable
	animate:name
	use:action
	transition:fn
	bind:value={inputValue}
	in:fn
	out:fn
/>
<slot name="content" {def} {abc} data-foo />
