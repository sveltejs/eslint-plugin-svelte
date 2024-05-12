<script>
	export let a = true;
	export let b = true;
	export let c = true;
</script>

{#if a}
	<div>foo</div>
{:else if b}
	<div>bar</div>
{:else if c}
	<div>baz</div>
{/if}
