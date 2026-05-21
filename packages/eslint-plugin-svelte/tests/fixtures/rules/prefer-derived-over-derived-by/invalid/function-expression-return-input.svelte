<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(function () {
		return a.b;
	});
</script>

{foo}
