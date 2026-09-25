<!--Test1.svelte-->
<script lang="ts">
	interface Props {
		a: { z: string };
		ab: { x: string };
	}

	let { a, ab }: Props = $props();

	const data = { ...a, z: a.z };
</script>

<p>{data.z}{ab.x}</p>
