<script>
	function fn() {}
	let items = $state([1, 2]);
</script>

{#if true}
	{@const f = () => {}}
	{@const g = fn}
	{@const n = null}
	{@const { k } = { k: () => {} }}
	{@const [m] = [() => {}]}
	<button onclick={f}>a</button>
	<button onclick={g}>b</button>
	<button onclick={n}>c</button>
	<button onclick={k}>d</button>
	<button onclick={m}>e</button>
{/if}
{#each items as item}
	{@const h = () => item}
	<button onclick={h}>f</button>
{/each}
