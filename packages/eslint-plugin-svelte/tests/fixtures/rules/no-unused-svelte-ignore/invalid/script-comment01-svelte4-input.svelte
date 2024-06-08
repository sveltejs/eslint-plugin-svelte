<script>
	let foo;
	// svelte-ignore unused-export-let
	export let used;
	// svelte-ignore module-script-reactive-declaration
	$: reactive = foo;
</script>

{used}
