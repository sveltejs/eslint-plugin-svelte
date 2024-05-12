<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#each [] as e}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/each}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#each [] as e}
		A
	{:else}
		<div></div>
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/each}
</div>
