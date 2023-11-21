<script>
	let mutable = $state(42);
	// svelte-ignore state-rune-not-mutated
	let immutable = $state(42);
	export function update(a) {
		mutable = a;
	}
</script>

{mutable}{immutable}
