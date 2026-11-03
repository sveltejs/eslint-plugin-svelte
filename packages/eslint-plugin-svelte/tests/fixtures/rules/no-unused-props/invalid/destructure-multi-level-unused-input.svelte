<script lang="ts">
	type Props = { a: { b: { c: number; d: number }; e: number } };
	const props: Props = $props();
	const { a } = props;
	const { b } = a;
	const { c } = b;
</script>

<p>{c}</p>
