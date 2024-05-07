<div>
	{#each [] as e}
		A
		<!-- svelte_ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{:else}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/each}
</div>
