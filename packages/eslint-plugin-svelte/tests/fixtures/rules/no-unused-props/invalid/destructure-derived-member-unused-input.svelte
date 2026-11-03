<script lang="ts">
	type Props = { user: { name: string; age: number } };
	const props: Props = $props();
	const { name } = $derived(props.user);
</script>

<p>{name}</p>
