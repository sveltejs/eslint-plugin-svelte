<script lang="ts">
	let a = $state({ b: 1 });
	const foo = $derived.by<number | string>((): number => a.b);
	const bar = $derived.by(<T,>(): T[] => [a.b as T]);
</script>

{foo}{bar}
