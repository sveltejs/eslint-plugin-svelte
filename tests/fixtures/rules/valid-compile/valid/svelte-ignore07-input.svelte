<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#await Promise.resolve(42)}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#await Promise.resolve(42)}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{:catch name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#await Promise.resolve(42)}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#await Promise.resolve(42) then n}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	<!-- svelte-ignore a11y_label_has_associated_control a11y_no_noninteractive_tabindex -->
	{#await Promise.resolve(42) catch n}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
