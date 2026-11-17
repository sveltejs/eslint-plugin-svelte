<script>
	const { data } = $props();
	let form = $state(data.form);
	$effect(() => {
		form = data.form;
	});
</script>

<input bind:value={form.name} />
