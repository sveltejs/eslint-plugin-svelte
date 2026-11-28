<script lang="ts">
	const k = 'foo' as const;
	let { [k]: c, data }: { foo: string; data: PageData } = $props();
</script>

{c}{data}
