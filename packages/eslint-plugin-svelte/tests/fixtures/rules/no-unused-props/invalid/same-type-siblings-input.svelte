<!--Test1.svelte-->
<script lang="ts">
	type Item = { x: string; y: string };
	type Props = { a: Item; b: Item };

	const { a, b }: Props = $props();
</script>

<p>{a.x}{b.x}</p>
