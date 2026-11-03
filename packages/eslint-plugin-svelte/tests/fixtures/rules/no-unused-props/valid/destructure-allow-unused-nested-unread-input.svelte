<script lang="ts">
	type Props = { user: { name: string; age: number }; b: string };
	let { user, b }: Props = $props();
	const { name } = user;
	console.log(b);
</script>
