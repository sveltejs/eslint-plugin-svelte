<script lang="ts">
	type Props = { label: string; count: number; user: { name: string; age: number } };
	const props: Props = $props();
	const {
		label,
		user: { name }
	} = props;
</script>

<p>{label} {name}</p>
