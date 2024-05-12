<script>
	$: {
		const foo = (recurse) => (recurse ? foo(false) : undefined);
	}
</script>
