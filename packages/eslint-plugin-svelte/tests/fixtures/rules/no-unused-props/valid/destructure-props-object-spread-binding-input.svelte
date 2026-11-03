<script lang="ts">
	type Props = { user: { name: string; age: number }; items: string[] };
	const props: Props = $props();
	const { user, items } = props;
	const copy = { ...user };
	const list = [...items];
</script>

<p>{copy.name} {list}</p>
