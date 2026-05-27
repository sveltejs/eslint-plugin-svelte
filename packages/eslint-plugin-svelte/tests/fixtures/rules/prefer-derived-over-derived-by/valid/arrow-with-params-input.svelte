<script>
	let a = $state(1);
	const foo = $derived.by((x) => x + a);
</script>

{foo}
