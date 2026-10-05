<!--Test1.svelte-->
<script lang="ts">
	interface Props {
		a: { x: string; y: string };
		b: { z: string };
	}

	let { a, b }: Props = $props();

	const data = { ...a, x: a.x };
</script>

<p>{data.x}</p>
