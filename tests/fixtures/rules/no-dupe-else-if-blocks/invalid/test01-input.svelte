<script>
	export let a = true;
	export let b = true;
	export let c = true;
</script>

<!-- ✓ GOOD -->
{#if a}
	<div>foo</div>
{:else if b}
	<div>bar</div>
{:else if c}
	<div>baz</div>
{/if}

<!-- ✗ BAD -->
{#if a}
	<div>foo</div>
{:else if b}
	<div>bar</div>
{:else if b}
	<div>baz</div>
{/if}

{#if a}
	<div>foo</div>
{:else if b}
	<div>bar</div>
{:else}
	baz
	{#if b}
		<div>qux</div>
	{/if}
{/if}
