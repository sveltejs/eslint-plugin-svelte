<script>
	let boxes = $state([
		{ width: 10, height: 10 },
		{ width: 15, height: 15 }
	]);
</script>

{#each boxes as box}
	{const area = $derived(box.width * box.height)}
	{box.width} * {box.height} = {area}
{/each}
