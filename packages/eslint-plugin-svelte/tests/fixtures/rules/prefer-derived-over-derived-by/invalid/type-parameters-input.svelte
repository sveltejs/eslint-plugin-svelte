<script lang="ts">
	let a = $state({ b: 1 });
	const foo = $derived.by(<T,>(): T[] => [a.b as T]);
	const bar = $derived.by(function <T>(): T[] {
		return [a.b as T];
	});
</script>

{foo}{bar}
