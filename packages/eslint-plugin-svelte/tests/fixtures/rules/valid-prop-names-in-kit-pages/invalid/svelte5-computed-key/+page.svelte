<script>
	const k = 'foo';
	const data = 'bar';
	let { [k]: c, [data]: d, ['baz']: e, data: f } = $props();
</script>

{c}{d}{e}{f}
