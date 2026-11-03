<!--Test1.svelte-->
<script lang="ts">
	type Props = {
		app: { name: string; meta: { x: string; y: string } };
	};
	const { app }: Props = $props();

	const data = { ...app, x: app.meta.x };
</script>

<p>{data.x}</p>
