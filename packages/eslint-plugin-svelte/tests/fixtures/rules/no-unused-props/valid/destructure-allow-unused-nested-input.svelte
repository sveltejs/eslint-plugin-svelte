<script lang="ts">
	type Props = { user: { name: string; age: number } };
	const props: Props = $props();
	const {
		user: { name }
	} = props;
</script>

<p>{name}</p>
