<!--Test1.svelte-->
<script lang="ts">
	type Props = { a: { z: string }; 'a.b': { x: string } };

	const props: Props = $props();

	const copy = { ...props['a.b'] };
</script>

<p>{copy.x}</p>
