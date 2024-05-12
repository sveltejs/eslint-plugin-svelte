<script>
	export let a = true;
	export let b = true;
	export let list = [1, 2, 3];
</script>

{#if a}
	<div>foo</div>
{:else if b}
	<div>bar</div>
{:else}<div>baz</div>{/if}
{#if b}<div>baz</div>{/if}

{#if a}
	<div>foo</div>
{:else if b}
	{#each list as b}
		{#if b}
			<div>baz</div>
		{/if}
	{/each}
{/if}
