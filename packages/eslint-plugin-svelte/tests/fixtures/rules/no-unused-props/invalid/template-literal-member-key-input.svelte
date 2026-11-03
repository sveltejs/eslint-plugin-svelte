<script lang="ts">
	type Props = { a: string; b: string };
	const props: Props = $props();
</script>

<p>{props[`a`]}</p>
