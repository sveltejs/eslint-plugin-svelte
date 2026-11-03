<script lang="ts">
	type Props = { a: string; b: string };
	const props: Props = $props();
	let copy: typeof props | null = null;
</script>

<p>{props.a} {copy}</p>
