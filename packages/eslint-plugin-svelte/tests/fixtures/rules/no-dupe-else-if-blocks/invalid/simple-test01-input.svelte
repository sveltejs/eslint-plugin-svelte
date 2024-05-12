<script>
	let foo = true;
</script>

{#if foo}
	<div>if</div>
{:else if foo}
	<div>else if</div>
{/if}
