<script lang="ts">
	type Props = { user: { name: string; age: number } };
	let { user }: Props = $props();
	const { name } = user;
</script>

<p>{name}</p>
