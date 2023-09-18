<script>
	const values = ['a', 'b'];
	$: first = values[0];
</script>

{first}
<input bind:value={values[0]} />
