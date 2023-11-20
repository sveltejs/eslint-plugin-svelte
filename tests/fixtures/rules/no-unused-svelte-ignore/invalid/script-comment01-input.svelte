<script>
	// svelte-ignore state-rune-not-mutated
	let used = $state(42);
	// svelte-ignore state-rune-not-mutated
	let unused = $state(42);
	export function update(a) {
		used = a;
	}
</script>

{used}{unused}
