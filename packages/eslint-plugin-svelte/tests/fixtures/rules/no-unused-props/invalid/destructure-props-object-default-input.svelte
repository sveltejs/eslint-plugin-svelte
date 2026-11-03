<script lang="ts">
	type Props = { user?: { name: string; age: number }; count: number };
	const props: Props = $props();
	const { user: { name } = { name: '', age: 0 } } = props;
</script>

<p>{name}</p>
