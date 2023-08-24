<script>
	export let a = true;
	export let b = true;
	export let c = true;
</script>

{#if b && c}
	<div>foo</div>
{:else if b || c}
	<div>bar</div>
{:else if a || c}
	<div>bar</div>
{/if}
