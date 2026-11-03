<script>
	let a = $state(1);
	const foo = $derived.by(function* () { yield a; });
</script>

{foo}
