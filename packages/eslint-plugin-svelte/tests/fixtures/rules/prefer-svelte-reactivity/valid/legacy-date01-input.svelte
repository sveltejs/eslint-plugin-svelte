<script>
	export let offset = 0;
	const date = new Date();
	date.setDate(date.getDate() + offset);
</script>

{date.toISOString()}
