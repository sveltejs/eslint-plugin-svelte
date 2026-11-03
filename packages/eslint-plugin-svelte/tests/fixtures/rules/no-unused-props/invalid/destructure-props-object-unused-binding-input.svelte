<script lang="ts">
	type Props = { user: { name: string; age: number }; b: string };
	const props: Props = $props();
	const { user, b } = props;
	console.log(b);
</script>
