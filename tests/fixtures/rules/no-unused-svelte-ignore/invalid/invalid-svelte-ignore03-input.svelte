<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0" />
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:catch name}
		<label tabindex="0">Click</label>
		<ul tabindex="0" />
	{/await}
</div>
<div>
	{#await Promise.resolve(42)}
		<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{:then name}
		<label tabindex="0">Click</label>
		<ul tabindex="0" />
	{/await}
</div>
