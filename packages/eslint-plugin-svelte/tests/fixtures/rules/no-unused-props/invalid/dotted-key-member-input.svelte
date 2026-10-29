<!--Test1.svelte-->
<script lang="ts">
	type Props = { a: { b: { x: string } }; 'a.b': string };

	const props: Props = $props();
</script>

<p>{props['a.b']}</p>
