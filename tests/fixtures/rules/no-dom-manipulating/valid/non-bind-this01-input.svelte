<script>
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};
</script>

<input bind:value={foo} />

<button on:click={() => remove()}>Click Me</button>
