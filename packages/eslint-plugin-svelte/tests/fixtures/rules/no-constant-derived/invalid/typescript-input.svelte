<script lang="ts">
	const SIZES = ['s', 'm'] as const;

	let size = $derived<string>('s');
	let sizes = $derived(SIZES satisfies readonly string[]);
	let maybe = $derived(null as string | null);
	let getter = $derived<() => number>(() => 1);
	let typed = $derived((): number => 1);
</script>

{size}{sizes}{maybe}{getter()}{typed()}
