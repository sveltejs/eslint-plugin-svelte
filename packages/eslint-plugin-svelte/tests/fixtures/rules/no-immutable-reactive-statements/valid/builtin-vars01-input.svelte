<script>
	$: desc = $$slots.description;
</script>

<div>
	<slot name="title" />
	{#if desc}
		<hr />
		<slot name="description" />
	{/if}
</div>
