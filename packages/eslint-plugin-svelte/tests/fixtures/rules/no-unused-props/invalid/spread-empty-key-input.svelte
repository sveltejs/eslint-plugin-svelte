<!--Test1.svelte-->
<script lang="ts">
	type Props = { '': { q: string }; b: { r: string } };

	const props: Props = $props();

	const copy = { ...props[''] };
</script>

<p>{copy.q}</p>
