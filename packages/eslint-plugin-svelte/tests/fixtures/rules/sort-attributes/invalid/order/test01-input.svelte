<script>
	import MyComponent from './MyComponent.svelte';
	let data, comp, abc, def;
	let foo, bar;
	let src;
	const color = 'red';
	function name() {}
	function fn() {}
</script>

<MyComponent bind:data bind:this={comp} {abc} {def} data-foo />
<input
	class:bar
	class="my-block"
	id="foo"
	bind:this={foo}
	value="abc"
	style:color
	style="width: 30px;"
	data-value="x"
	animate:name
	in:fn
	out:fn
	transition:fn
/>
<img alt="bar" {src} id="bar" />
