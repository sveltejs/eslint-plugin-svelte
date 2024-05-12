<script>
	const queueMicrotask2 = queueMicrotask;
	let a = 0;

	$: {
		queueMicrotask(() => {
			a = a + 1;
		});
	}

	$: {
		queueMicrotask2(() => {
			a = a + 1;
		});
	}
</script>
