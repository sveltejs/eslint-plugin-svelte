<script context="module">
	let foo;
</script>

<script>
	// svelte-ignore unused-export-let
	export let unused;
	let bar;

	// svelte-ignore module-script-reactive-declaration
	$: {
		// svelte-ignore module-script-reactive-declaration
		bar = foo;
	}
</script>
