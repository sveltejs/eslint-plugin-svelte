<div>
	{#if true}
		A
		<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{:else}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/if}
</div>
