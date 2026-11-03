<script lang="ts">
	type Props = { a?: string; b: string };
	const props: Props = $props();
	const { a = 'x', b } = props;
	console.log(b);
</script>
