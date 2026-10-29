<!--Test1.svelte-->
<script lang="ts">
	type Props = {
		rows: string[] & { label: string; extra: string };
	};
	const { rows }: Props = $props();

	const list = [...rows];
</script>

<p>{list.length}{rows.label}</p>
