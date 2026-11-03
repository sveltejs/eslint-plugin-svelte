<script>
	let a = $state(1);
	const foo = $derived.by(async () => await Promise.resolve(a));
</script>

{foo}
