<!--Test1.svelte-->
<script lang="ts">
	type Props = { a: { z: string }; 'a.b': { x: string; y: number } };

	const props: Props = $props();

	const copy = { ...props.a };
</script>

<p>{copy.z}{props['a.b'].x}</p>
