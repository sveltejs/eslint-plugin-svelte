<script>
	import MyComponent from './MyComponent.svelte';
	let data, comp, abc, def;
	let foo, bar;
	let src;
	const color = 'red';
	function name() {}
	function fn() {}
</script>

<MyComponent bind:this={comp} bind:data {abc} {def} data-foo />
<input
	class="my-block"
	class:bar
	id="foo"
	value="abc"
	bind:this={foo}
	style:color
	style="width: 30px;"
	data-value="x"
	animate:name
	in:fn
	out:fn
	transition:fn
/>
<img {src} alt="bar" id="bar" />
