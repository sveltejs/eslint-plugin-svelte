<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
	const { label } = props;
	$inspect(props);
</script>

<p>{label}</p>
