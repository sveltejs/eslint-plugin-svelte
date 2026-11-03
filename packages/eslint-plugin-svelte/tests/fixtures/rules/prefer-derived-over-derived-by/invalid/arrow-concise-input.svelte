<script>
	let a = $state({ b: 1 });
	const foo = $derived.by(() => a.b);
</script>

{foo}
