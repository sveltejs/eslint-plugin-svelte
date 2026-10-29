<!--Test1.svelte-->
<script lang="ts">
	type Props = {
		a: { x: string; y: string };
		b: string;
	};
	const props: Props = $props();

	const data = { ...props, x: props.a.x };
</script>

<p>{data.x}</p>
