<script>
	const list = [1, 2, 3];

	const remove = () => {
		for (const item of list) {
			item.remove();
		}
	};
</script>

{#each list as item}
	<input bind:this={item} />
{/each}

<button on:click={() => remove()}>Click Me</button>
