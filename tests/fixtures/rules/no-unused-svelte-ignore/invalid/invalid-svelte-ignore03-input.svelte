<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
		<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{:catch name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
