<script>
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];
	function fn(thing) {
		return thing.id;
	}
</script>

{#each things as thing (fn(thing))}
	{thing.name}
{/each}
