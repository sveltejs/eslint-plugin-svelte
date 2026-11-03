<script lang="ts">
	type Props = { user: { name: string; age: number }; count: number };
	let { user }: Props = $props();
	const k = 'name' as const;
	const v = user[k];
</script>

<p>{v}</p>
