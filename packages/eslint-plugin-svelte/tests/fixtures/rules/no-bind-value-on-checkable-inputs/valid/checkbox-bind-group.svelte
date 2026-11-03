<script>
	let flavours = $state([]);
</script>

{#each ['cookies and cream', 'mint choc chip', 'raspberry ripple'] as flavour}
	<label>
		<input type="checkbox" name="flavours" value={flavour} bind:group={flavours} />

		{flavour}
	</label>
{/each}
