<script lang="ts">
	type Props = { a: string; b: string };
	const props: Props = $props();
	let x: typeof props.a = props.a;
</script>

<p>{x}</p>
