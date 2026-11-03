<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
	const { label } = props;
</script>

<p>{label} {props.count}</p>
