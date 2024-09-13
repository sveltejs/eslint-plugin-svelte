<script module>
	let foo;
</script>

<script>
	// svelte-ignore export_let_unused
	export let unused;
	let bar;

	// svelte-ignore reactive_declaration_module_script
	$: {
		bar = foo;
	}
</script>
