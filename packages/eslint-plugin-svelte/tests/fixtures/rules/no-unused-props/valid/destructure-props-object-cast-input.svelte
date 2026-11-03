<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
	const { label } = $derived.by(() => props);
	const { count } = props as Props;
</script>

<p>{label} {count}</p>
