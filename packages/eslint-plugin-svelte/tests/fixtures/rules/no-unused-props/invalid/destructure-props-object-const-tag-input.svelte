<script lang="ts">
	type Props = { label: string; count: number };
	const props: Props = $props();
</script>

{#if true}
	{@const { label } = props}
	<p>{label}</p>
{/if}
