<script>
	import A from 'A.svelte';

	const foo = 'foo';
	let text = '';
	let value = '';
	let input;
	const myClass = 'my-class';
	const id = 'id';
	const attrs = {};
	const bar = '<div></div>';
	const o1 = 1,
		o2 = 2;
	const expression = true;
	const list = [];
</script>

<!-- prettier-ignore -->
<div>
{foo}
<input bind:value={text} this={input} class="foo {myClass}" />
<input bind:value {id} />
<input {...attrs} />
{@html bar}
{@debug o1}
{@debug o1, o2}

{#if expression}...{/if}
{#if expression}...{:else if expression}...{/if}
{#if expression}...{:else}...{/if}
{#if expression}{:else}{/if}

{#each list as item}...{/each}
{#each list as item, index}...{/each}
{#each list as item (item.key)}...{/each}
{#each list as item, index (item.key)}...{/each}
{#each list as item}...{:else}...{/each}

{#await expression}...{:then name}...{:catch name}...{/await}
{#await expression}...{:then name}...{/await}
{#await expression then name}...{/await}
{#await expression catch name}...{/await}
{#await expression then}...{/await}
{#await expression catch}...{/await}
{#await expression}...{:then}...{:catch}...{/await}

{#key expression}...{/key}
</div>

<!--tests/fixtures/rules/mustache-spacing/invalid/test01-input.svelte-->
