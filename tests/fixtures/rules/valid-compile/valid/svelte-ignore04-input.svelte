<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#if true}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/if}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#if true}
		A
	{:else}
		<div></div>
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/if}
</div>
