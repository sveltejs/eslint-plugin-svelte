<script>
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];
</script>

{#each things as thing (key)}
	{@const key = thing.id}
	{thing.name}
{/each}
