<script>
	let value = 0;
	$: reactiveFn = value % 2 ? () => console.log('odd') : () => console.log('even');
</script>

<button on:click={reactiveFn} />
<input type="number" bind:value />
