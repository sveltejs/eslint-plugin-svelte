<script>
	import MyComponent from './MyComponent.svelte';
	let data, comp, abc, def;
	let foo, bar;
	let src;
	const color = 'red';
	function name() {}
	function fn() {}
</script>

<MyComponent data-foo bind:this={comp} bind:data {abc} {def} />
<input
	id="foo"
	class="my-block"
	class:bar
	value="abc"
	data-value="x"
	style="width: 30px;"
	style:color
	animate:name
	transition:fn
	in:fn
	out:fn
	bind:this={foo}
/>
<img id="bar" {src} alt="bar" />
