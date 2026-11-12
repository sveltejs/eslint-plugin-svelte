<script>
	const g = 1;
	const obj = { a: 1 };
	let items = $state([1, 2]);
</script>

<button onclick={g}>a</button>
{#if true}
	{@const h = 1}
	{@const s = `text`}
	{@const o = obj}
	{@const chain = h}
	<button onclick={h}>b</button>
	<button onclick={s}>c</button>
	<button onclick={o}>d</button>
	<button onclick={chain}>e</button>
{/if}
{#each items as item}
	{@const arr = [item]}
	<button onclick={arr}>f</button>
{/each}
{#snippet foo()}
	{@const C = class {}}
	<button onclick={C}>g</button>
{/snippet}
