<script lang="ts">
	let a = $state({ b: 1 });
	const foo = $derived.by<Map<string, number>>(() => new Map([["b", a.b]]));
	const bar = $derived.by<number[]>(() => {
		return [a.b];
	});
</script>

{foo}{bar}
