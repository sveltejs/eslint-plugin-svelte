<script lang="ts">
	let a = $state({ b: 1 });
	const foo = $derived.by<number | string>((): number => a.b);
	const bar = $derived.by<number>((): number => a.b);
</script>

{foo}{bar}
