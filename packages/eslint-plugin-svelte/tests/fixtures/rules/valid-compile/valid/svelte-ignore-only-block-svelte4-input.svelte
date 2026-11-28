<script>
	let p = Promise.resolve(1);
	let items = [1];
	let ok = true;
</script>

{#await p}
	<!-- svelte-ignore a11y-missing-attribute -->
{:then v}
	{v}
{/await}

{#if ok}
	<!-- svelte-ignore a11y-missing-attribute -->
{:else}
	<!--
		svelte-ignore a11y-missing-attribute
	-->
{/if}

{#each items as item}
	<!-- svelte-ignore a11y-missing-attribute -->
{/each}

{#key ok}
	<!-- svelte-ignore a11y-missing-attribute -->
{/key}
