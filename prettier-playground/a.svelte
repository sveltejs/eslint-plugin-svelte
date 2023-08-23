<svelte:options immutable={true} />

<script>
	let a = 1;
	let b = 2;
	let c = 2;
	function handleClick() {
		alert('clicked');
	}
	let value = 'abc';
	let current = '';
	let big = true;
</script>

<input type="number" bind:value={a} />
<input type="number" bind:value={b} />
<input type="number" bind:value={c} disabled={true} />

<p>{a} + {b} = {a + b + c}</p>

<input type="text" {value} />
<input type="text" {value} />
<p>{@html a}</p>
{@debug a}
<!--comment-->

<button on:click|once|capture={handleClick}>Click me</button>
<button on:click|capture|once={handleClick}>Click me</button>

<button class={current === 'foo' ? 'selected' : ''} on:click={() => (current = 'foo')}>
	foo
</button>
<div class:big>
	<!-- ... -->
</div>
