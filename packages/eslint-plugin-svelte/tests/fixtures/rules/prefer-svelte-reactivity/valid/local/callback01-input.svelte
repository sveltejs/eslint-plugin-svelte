<script>
	let filters = $state({});
</script>

<input
	type="date"
	onchange={(e) => {
		const date = e.currentTarget.value;
		filters.date = {
			gte: date ? new Date(new Date(date).setHours(0, 0, 0)) : date
		};
	}}
/>
