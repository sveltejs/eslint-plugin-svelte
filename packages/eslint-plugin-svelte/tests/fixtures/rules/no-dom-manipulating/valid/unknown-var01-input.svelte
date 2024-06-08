<script>
	const remove = () => {
		unknown.remove();
	};
</script>

<input bind:this={unknown} />

<button on:click={() => remove()}>Click Me</button>
