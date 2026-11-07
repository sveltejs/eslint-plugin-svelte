<script>
	const { n } = $props();
	let { a } = $state({ a: 0 });
	$effect(() => {
		a = n * 2;
	});
</script>

<p>{a}</p>
