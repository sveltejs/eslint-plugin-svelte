<div>
	<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{#if true}
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/if}
</div>
<div>
	<!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
	{#if true}
		A
	{:else}
		<div></div>
		<label tabindex="0">Click</label>
		<ul tabindex="0"></ul>
	{/if}
</div>
