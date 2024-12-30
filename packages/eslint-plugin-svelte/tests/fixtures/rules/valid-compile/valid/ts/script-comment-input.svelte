<script module>
	let foo;
</script>

<script lang="ts">
	// svelte-ignore export_let_unused
	export let unused;
	// svelte-ignore reactive_declaration_module_script
	$: reactive = foo;
</script>
