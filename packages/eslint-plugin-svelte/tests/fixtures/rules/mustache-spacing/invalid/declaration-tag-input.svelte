{#each boxes as box}
	{ let area = box.width * box.height }
	{ function label(value) {
		return `${value} square pixels`;
	} }
{/each}
