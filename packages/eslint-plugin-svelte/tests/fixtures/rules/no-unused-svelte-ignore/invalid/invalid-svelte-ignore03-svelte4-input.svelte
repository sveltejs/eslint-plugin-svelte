<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:catch name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/await}
</div>
