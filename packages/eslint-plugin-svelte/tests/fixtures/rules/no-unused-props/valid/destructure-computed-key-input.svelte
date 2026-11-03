<script lang="ts">
	type Props = { user: { name: string; age: number } };
	const props: Props = $props();
	const key = 'name' as const;
	const {
		user: { [key]: value }
	} = props;
</script>

<p>{value}</p>
