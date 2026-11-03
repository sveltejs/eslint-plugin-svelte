<!--Test1.svelte-->
<script lang="ts">
	type Meta = { x: string; y: string };
	type Props = {
		a: { meta: Meta };
		b: { meta: Meta };
		c: { meta: Meta };
	};
	const { a, b, c }: Props = $props();

	const data = {
		...a?.meta,
		...b.meta!,
		...(c.meta as Meta),
		x: a.meta.x + b.meta.x + c.meta.x
	};
</script>

<p>{data.x}</p>
