<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
	const { label, ...rest } = props;
</script>

<p {...rest}>{label}</p>
