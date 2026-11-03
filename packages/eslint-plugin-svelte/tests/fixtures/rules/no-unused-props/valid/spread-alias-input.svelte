<!--Test1.svelte-->
<script lang="ts">
	type Props = {
		app: { name: string; description: string };
	};
	const { app: a }: Props = $props();

	const data = { ...a, name: `${a.name} (copy)` };
</script>

<p>{data.name}</p>
