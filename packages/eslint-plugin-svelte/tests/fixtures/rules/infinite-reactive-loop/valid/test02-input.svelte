<script>
	let a = 0;

	const func = () => {
		setTimeout(() => {
			a = a + 1;
		}, 100);
	};
	$: func();
</script>
