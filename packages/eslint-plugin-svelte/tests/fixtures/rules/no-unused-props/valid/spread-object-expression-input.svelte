<!--Test1.svelte-->
<script lang="ts">
	type Props = {
		app: { name: string; description: string };
	};
	const { app }: Props = $props();

	const data = { ...app, name: `${app.name} (copy)` };
</script>

<p>{data.name}</p>
