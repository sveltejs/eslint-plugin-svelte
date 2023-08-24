<script>
	import MyComponent from './MyComponent.svelte';
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};
</script>

<MyComponent bind:this={foo}>div</MyComponent>
<svelte:component this={MyComponent} bind:this={bar}>div</svelte:component>

<button on:click={() => remove()}>Click Me</button>
