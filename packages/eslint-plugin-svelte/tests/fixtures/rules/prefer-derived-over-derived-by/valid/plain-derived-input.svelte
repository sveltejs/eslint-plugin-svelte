<script>
	let a = $state({ b: 1 });
	const foo = $derived(a.b);
</script>

{foo}
