<script>
	const setTimeout2 = setTimeout;
	let a = 0;

	function doSomething(fn) {
		fn();
	}

	$: {
		setTimeout(() => {
			a = a + 1;
		});
	}

	$: {
		setTimeout2(() => {
			a = a + 1;
		});

		doSomething(() => {
			a = a + 1;
		});
	}
</script>
