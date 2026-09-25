<!--Test1.svelte-->
<script lang="ts">
	interface Props {
		a: {
			b: { c: string; d: number };
		};
	}

	let { a }: Props = $props();

	const data = { ...a.b, c: a.b.c };
</script>

<p>{data.c}</p>
