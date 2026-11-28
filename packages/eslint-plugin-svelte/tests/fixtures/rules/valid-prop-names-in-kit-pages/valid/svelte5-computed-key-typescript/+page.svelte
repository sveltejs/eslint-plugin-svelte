<script lang="ts">
	const k = 'data' as const;
	const f: 'form' = 'form';
	let { [k]: c, [f]: d }: { data: PageData; form: ActionData } = $props();
</script>

{c}{d}
