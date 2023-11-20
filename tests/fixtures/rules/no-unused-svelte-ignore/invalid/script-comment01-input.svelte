<script>
	// svelte-ignore state-rune-not-mutated
	let mutable = $state(42);
	// svelte-ignore state-rune-not-mutated
	let immutable = $state(42);
	export function update(a) {
		immutable = a;
	}
</script>

{mutable}{immutable}
