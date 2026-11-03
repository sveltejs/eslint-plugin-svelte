<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
	function format(p: Props) {
		return `${p.label}: ${p.count}`;
	}
</script>

<p>{format(props)}</p>
