<script>
	const setInterval2 = setInterval;
	let a = 0;

	$: {
		setInterval(() => {
			a = a + 1;
		});
	}

	$: {
		setInterval2(() => {
			a = a + 1;
		});
	}
</script>
