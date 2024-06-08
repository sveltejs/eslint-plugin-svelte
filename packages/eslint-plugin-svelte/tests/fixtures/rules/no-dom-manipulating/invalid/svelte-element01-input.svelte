<script>
	export let tag = 'div';
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};
</script>

<p bind:this={foo}>div</p>
<svelte:element this={tag} bind:this={bar}>div</svelte:element>

<button on:click={() => remove()}>Click Me</button>
