<script lang="ts">
	let a = $state({ b: 1 });
	const foo = $derived<Map<string, number>>(new Map([["b", a.b]]));
	const bar = $derived<number[]>([a.b]);
</script>

{foo}{bar}
